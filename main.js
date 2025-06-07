import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

const container = document.getElementById('container');
const ui = document.getElementById('ui');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, window.innerWidth/window.innerHeight, 0.1, 1000);
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

const textureLoader = new THREE.TextureLoader();

// Sun texture (only one version)
const sunTexture = textureLoader.load('2k_sun.jpg');
const sun = new THREE.Mesh(
  new THREE.SphereGeometry(3, 32, 32),
  new THREE.MeshBasicMaterial({ map: sunTexture })
);
scene.add(sun);

const planetTextures = {
  Mercury: 'mercury.jpg',
  Venus: 'venus.jpg',
  Earth: 'earth.jpg',
  Mars: 'mars.jpg',
  Jupiter: 'jupiter.jpg',
  Saturn: 'saturn.jpg',
  Uranus: 'uranus.jpg',
  Neptune: 'neptune.jpg',
};

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
        map: textureLoader.load('saturn_ring.png'),
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.7,
      })
    );
    ring.rotation.x = 0.44;
    scene.add(ring);
    planet.ring = ring;
  }

  // Label creation
  const div = document.createElement('div');
  div.className = 'planet-label';
  div.textContent = data.name;
  div.style.position = 'absolute';
  div.style.color = '#fff';
  div.style.pointerEvents = 'none';
  div.style.fontSize = '12px';
  div.style.fontFamily = 'sans-serif';
  document.body.appendChild(div);
  labels.push({ element: div, planet });
});

// UI sliders for planet speeds
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

// Play/Pause button
const playPauseBtn = document.createElement('button');
playPauseBtn.id = 'playPauseBtn';
playPauseBtn.textContent = 'Pause';
ui.appendChild(playPauseBtn);

let isPaused = false;
playPauseBtn.addEventListener('click', () => {
  isPaused = !isPaused;
  playPauseBtn.textContent = isPaused ? 'Play' : 'Pause';
});

// Resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / (window.innerHeight - 60);
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight - 60);
});

// Add stars
function addStar() {
  const geometry = new THREE.SphereGeometry(0.2, 24, 24);
  const material = new THREE.MeshStandardMaterial({ color: 0xffffff });
  const star = new THREE.Mesh(geometry, material);
  star.position.set(...Array(3).fill().map(() => THREE.MathUtils.randFloatSpread(100)));
  scene.add(star);
}
Array(1000).fill().forEach(addStar);

// Camera drag controls (mouse + touch)
let mouseX = 0, mouseY = 0, targetX = 0, targetY = 0;
let isDragging = false, isDraggingOnUI = false;

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

document.addEventListener('touchstart', (event) => {
  if (event.touches.length === 1) {
    isDraggingOnUI = ui.contains(event.target);
    isDragging = !isDraggingOnUI;
  }
});

document.addEventListener('touchend', () => { isDragging = false; });

document.addEventListener('touchmove', (event) => {
  if (isDragging && event.touches.length === 1) {
    const touch = event.touches[0];
    mouseX = (touch.clientX / window.innerWidth) * 2 - 1;
    mouseY = - (touch.clientY / window.innerHeight) * 2 + 1;
  }
});

// Pinch to zoom support variables
let prevDistance = null;
let zoomSpeed = 0.1;

// Handle pinch zoom
document.addEventListener('touchmove', (event) => {
  if (event.touches.length === 2) {
    const dx = event.touches[0].clientX - event.touches[1].clientX;
    const dy = event.touches[0].clientY - event.touches[1].clientY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (prevDistance !== null) {
      const delta = distance - prevDistance;
      camera.position.z -= delta * zoomSpeed;
      camera.position.z = THREE.MathUtils.clamp(camera.position.z, 20, 150);
    }
    prevDistance = distance;
  }
});

document.addEventListener('touchend', (event) => {
  if (event.touches.length < 2) {
    prevDistance = null;
  }
});

// Zoom with mouse wheel
document.addEventListener('wheel', (event) => {
  camera.position.z += event.deltaY * 0.05;
  camera.position.z = THREE.MathUtils.clamp(camera.position.z, 20, 150);
});

// Theme Toggle: only background and UI color changes
const themeToggle = document.getElementById('themeToggle');
themeToggle.addEventListener('click', () => {
  const isDark = document.body.style.background === 'rgb(0, 0, 0)' || document.body.style.background === '#000' || !document.body.style.background;
  if (isDark) {
    document.body.style.background = '#fff';
    ui.style.background = '#ddd';
    ui.style.color = '#000';
  } else {
    document.body.style.background = '#000';
    ui.style.background = '#111';
    ui.style.color = '#fff';
  }
});

function animate() {
  requestAnimationFrame(animate);
  if (isPaused) return;

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

  // Update label positions
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
