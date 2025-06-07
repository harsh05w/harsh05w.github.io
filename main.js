import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

const container = document.getElementById('container');
const ui = document.getElementById('ui');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 5, 60);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight - 60);
container.appendChild(renderer.domElement);

// Lighting
const light = new THREE.PointLight(0xffffff, 40, 300);
light.position.set(0, 0, 20);
scene.add(light);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

// Sun
const textureLoader = new THREE.TextureLoader();
const sunTexture = textureLoader.load('/Solar System Sim/Public/assets/2k_sun.jpg');
const sun = new THREE.Mesh(
  new THREE.SphereGeometry(3, 32, 32),
  new THREE.MeshBasicMaterial({ map: sunTexture })
);
scene.add(sun);

// Planet data
const planetsData = [
  { name: 'Mercury', size: 0.6, distance: 5 },
  { name: 'Venus', size: 1, distance: 7 },
  { name: 'Earth', size: 1.2, distance: 10 },
  { name: 'Mars', size: 0.9, distance: 13 },
  { name: 'Jupiter', size: 2.9, distance: 18 },
  { name: 'Saturn', size: 2, distance: 23 },
  { name: 'Uranus', size: 1.7, distance: 27 },
  { name: 'Neptune', size: 1.6, distance: 31 },
];

const planetTextures = {
  Mercury: '/Solar System Sim/Public/assets/mercury.jpg',
  Venus: '/Solar System Sim/Public/assets/venus.jpg',
  Earth: '/Solar System Sim/Public/assets/earth.jpg',
  Mars: '/Solar System Sim/Public/assets/mars.jpg',
  Jupiter: '/Solar System Sim/Public/assets/jupiter.jpg',
  Saturn: '/Solar System Sim/Public/assets/saturn.jpg',
  Uranus: '/Solar System Sim/Public/assets/uranus.jpg',
  Neptune: '/Solar System Sim/Public/assets/neptune.jpg',
};

const planets = [];
const labels = [];

planetsData.forEach(data => {
  const geo = new THREE.SphereGeometry(data.size, 32, 32);
  const texture = textureLoader.load(planetTextures[data.name]);
  const mat = new THREE.MeshStandardMaterial({ map: texture });
  const mesh = new THREE.Mesh(geo, mat);
  scene.add(mesh);

  const planet = { ...data, mesh, angle: Math.random() * Math.PI * 2, speed: 0.01 };
  planets.push(planet);

  // Orbit ring
  const orbitCurve = new THREE.EllipseCurve(0, 0, data.distance, data.distance, 0, 2 * Math.PI);
  const points = orbitCurve.getPoints(100).map(p => new THREE.Vector3(p.x, 0, p.y));
  const orbit = new THREE.LineLoop(
    new THREE.BufferGeometry().setFromPoints(points),
    new THREE.LineBasicMaterial({ color: 0x888888 })
  );
  scene.add(orbit);

  // Saturn ring
  if (data.name === 'Saturn') {
    const ringGeo = new THREE.RingGeometry(data.size * 1.2, data.size * 2, 64);
    ringGeo.rotateX(-Math.PI / 2);
    const ring = new THREE.Mesh(
      ringGeo,
      new THREE.MeshStandardMaterial({
        map: textureLoader.load('/Solar System Sim/Public/assets/saturn_ring.png'),
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.7,
      })
    );
    ring.rotation.x = 0.44;
    scene.add(ring);
    planet.ring = ring;
  }

  // Label
  const div = document.createElement('div');
  div.className = 'planet-label';
  div.textContent = data.name;
  document.body.appendChild(div);
  labels.push({ element: div, planet });
});

// UI Sliders
planets.forEach(planet => {
  const label = document.createElement('label');
  label.textContent = planet.name;

  const slider = document.createElement('input');
  slider.type = 'range';
  slider.min = '0';
  slider.max = '0.05';
  slider.step = '0.001';
  slider.value = '0.01';
  slider.addEventListener('input', e => {
    planet.speed = parseFloat(e.target.value);
  });

  label.appendChild(slider);
  ui.appendChild(label);
});

// Resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / (window.innerHeight - 60);
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight - 60);
});

// Stars
function addStar() {
  const geometry = new THREE.SphereGeometry(0.2, 24, 24);
  const material = new THREE.MeshStandardMaterial({ color: 0xffffff });
  const star = new THREE.Mesh(geometry, material);
  star.position.set(...Array(3).fill().map(() => THREE.MathUtils.randFloatSpread(100)));
  scene.add(star);
}
Array(1000).fill().forEach(addStar);

// Mouse + Touch Camera Controls
let mouseX = 0, mouseY = 0, targetX = 0, targetY = 0;
let isDragging = false, isDraggingOnUI = false;
let previousTouches = [];

document.addEventListener('mousedown', (event) => {
  isDraggingOnUI = ui.contains(event.target);
  isDragging = !isDraggingOnUI;
});
document.addEventListener('mouseup', () => { isDragging = false; });
document.addEventListener('mousemove', (event) => {
  if (isDragging) {
    mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    mouseY = - (event.clientY / window.innerHeight) * 2 + 1;
  }
});

// Mouse scroll zoom
document.addEventListener('wheel', (e) => {
  camera.position.z += e.deltaY * 0.05;
  camera.position.z = THREE.MathUtils.clamp(camera.position.z, 10, 200);
});

// Touch support
container.addEventListener('touchstart', (e) => {
  previousTouches = [...e.touches];
}, { passive: true });

container.addEventListener('touchmove', (e) => {
  if (e.touches.length === 1 && previousTouches.length === 1) {
    const dx = e.touches[0].clientX - previousTouches[0].clientX;
    const dy = e.touches[0].clientY - previousTouches[0].clientY;
    mouseX += dx / window.innerWidth;
    mouseY -= dy / window.innerHeight;
  } else if (e.touches.length === 2 && previousTouches.length === 2) {
    const dist1 = Math.hypot(
      e.touches[0].clientX - e.touches[1].clientX,
      e.touches[0].clientY - e.touches[1].clientY
    );
    const dist2 = Math.hypot(
      previousTouches[0].clientX - previousTouches[1].clientX,
      previousTouches[0].clientY - previousTouches[1].clientY
    );
    const zoomDelta = dist2 - dist1;
    camera.position.z += zoomDelta * 0.02;
    camera.position.z = THREE.MathUtils.clamp(camera.position.z, 10, 200);
  }
  previousTouches = [...e.touches];
}, { passive: true });

// Animation Loop
function animate() {
  requestAnimationFrame(animate);

  planets.forEach(planet => {
    planet.angle += planet.speed;
    planet.mesh.position.set(
      Math.cos(planet.angle) * planet.distance,
      0,
      Math.sin(planet.angle) * planet.distance
    );
    planet.mesh.rotation.y += 0.01;
    if (planet.ring) {
      planet.ring.position.copy(planet.mesh.position);
      planet.ring.rotation.x = 0.44;
    }
  });

  // Camera drag effect
  targetX += (mouseX - targetX) * 0.05;
  targetY += (mouseY - targetY) * 0.05;
  camera.position.x = targetX * 30;
  camera.position.y = 5 + targetY * 10;
  camera.lookAt(0, 0, 0);

  // Update labels
  labels.forEach(({ element, planet }) => {
    const vector = planet.mesh.position.clone().project(camera);
    const x = (vector.x * 0.5 + 0.5) * window.innerWidth;
    const y = (-vector.y * 0.5 + 0.5) * (window.innerHeight - 60);
    element.style.transform = `translate(-50%, -50%) translate(${x}px,${y}px)`;
    element.style.display = vector.z < 1 ? 'block' : 'none';
  });

  renderer.render(scene, camera);
}
animate();

// Theme Toggle
const themeToggle = document.getElementById('themeToggle');
let isDark = true;
themeToggle.addEventListener('click', () => {
  isDark = !isDark;
  document.body.style.background = isDark ? '#000' : '#fff';
  ui.style.background = isDark ? '#111' : '#ddd';
  ui.style.color = isDark ? '#fff' : '#000';
});
