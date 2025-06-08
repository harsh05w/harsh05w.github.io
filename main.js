import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

const container = document.getElementById('container');
const ui = document.getElementById('ui');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / (window.innerHeight - 60), 0.1, 1000);
camera.position.set(0, 5, 60);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight - 60);
container.appendChild(renderer.domElement);

// Loaders
const textureLoader = new THREE.TextureLoader();

// Background: Star Sphere
const starTexture = textureLoader.load('assets/stars.jpg');
const starGeo = new THREE.SphereGeometry(500, 64, 64);
const starMat = new THREE.MeshBasicMaterial({ map: starTexture, side: THREE.BackSide });
const starField = new THREE.Mesh(starGeo, starMat);
scene.add(starField);

// Physical stars
const starMatSmall = new THREE.MeshBasicMaterial({ color: 0xffffff });
for (let i = 0; i < 1000; i++) {
  const star = new THREE.Mesh(new THREE.SphereGeometry(0.1, 6, 6), starMatSmall);
  star.position.set(
    (Math.random() - 0.5) * 1000,
    (Math.random() - 0.5) * 1000,
    (Math.random() - 0.5) * 1000
  );
  scene.add(star);
}

// Lighting
const light = new THREE.PointLight(0xffffff, 40, 300);
light.position.set(0, 0, 20);
scene.add(light);
scene.add(new THREE.AmbientLight(0xffffff, 0.5));

// Sun
const sunTexture = textureLoader.load('assets/2k_sun.jpg');
const sun = new THREE.Mesh(
  new THREE.SphereGeometry(3, 32, 32),
  new THREE.MeshBasicMaterial({ map: sunTexture })
);
scene.add(sun);

// Planet Data
const planetTextures = {
  Mercury: 'assets/mercury.jpg',
  Venus: 'assets/venus.jpg',
  Earth: 'assets/earth.jpg',
  Mars: 'assets/mars.jpg',
  Jupiter: 'assets/jupiter.jpg',
  Saturn: 'assets/saturn.jpg',
  Uranus: 'assets/uranus.jpg',
  Neptune: 'assets/neptune.jpg',
};

const planetsData = [
  { name: 'Mercury', size: 0.6, distance: 5 },
  { name: 'Venus', size: 1, distance: 7 },
  { name: 'Earth', size: 1.2, distance: 10 },
  { name: 'Mars', size: 0.9, distance: 13 },
  { name: 'Jupiter', size: 2.9, distance: 17 },
  { name: 'Saturn', size: 2, distance: 26 },
  { name: 'Uranus', size: 1.7, distance: 30 },
  { name: 'Neptune', size: 1.6, distance: 34 },
];

const planets = [];
const labels = [];

planetsData.forEach(data => {
  const geo = new THREE.SphereGeometry(data.size, 32, 32);
  const mat = new THREE.MeshStandardMaterial({ map: textureLoader.load(planetTextures[data.name]) });
  const mesh = new THREE.Mesh(geo, mat);
  scene.add(mesh);

  const planet = { ...data, mesh, angle: Math.random() * Math.PI * 2, speed: 0.01 };
  planets.push(planet);

  // Orbits
  const orbitCurve = new THREE.EllipseCurve(0, 0, data.distance, data.distance, 0, 2 * Math.PI);
  const points = orbitCurve.getPoints(100).map(p => new THREE.Vector3(p.x, 0, p.y));
  const orbit = new THREE.LineLoop(
    new THREE.BufferGeometry().setFromPoints(points),
    new THREE.LineBasicMaterial({ color: 0x888888 })
  );
  scene.add(orbit);

  if (data.name === 'Saturn') {
    const ringGeo = new THREE.RingGeometry(data.size * 1.2, data.size * 2, 64);
    ringGeo.rotateX(-Math.PI / 2);
    const ring = new THREE.Mesh(
      ringGeo,
      new THREE.MeshStandardMaterial({
        map: textureLoader.load('assets/saturn_ring.png'),
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.7,
      })
    );
    ring.rotation.x = 0.44;
    scene.add(ring);
    planet.ring = ring;
  }

  if (data.name === 'Earth') {
    const moonGeo = new THREE.SphereGeometry(0.3, 32, 32);
    const moonMat = new THREE.MeshStandardMaterial({ map: textureLoader.load('assets/moon.jpg') });
    const moonMesh = new THREE.Mesh(moonGeo, moonMat);
    scene.add(moonMesh);
    planet.moon = { mesh: moonMesh, angle: 0 };
  }

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

// Asteroid belt (between Jupiter and Saturn)
for (let i = 0; i < 500; i++) {
  const asteroid = new THREE.Mesh(
    new THREE.SphereGeometry(Math.random() * 0.15, 8, 8),
    new THREE.MeshStandardMaterial({ color: 0x888888 })
  );
  const angle = Math.random() * Math.PI * 2;
  const radius = 21 + Math.random() * 3; // 21 to 24 units
  asteroid.position.set(Math.cos(angle) * radius, (Math.random() - 0.5) * 0.5, Math.sin(angle) * radius);
  scene.add(asteroid);
}

// Sliders
planets.forEach(planet => {
  const label = document.createElement('label');
  label.textContent = planet.name;

  const slider = document.createElement('input');
  slider.type = 'range';
  slider.min = '0';
  slider.max = '0.05';
  slider.step = '0.001';
  slider.value = '0.01';
  slider.addEventListener('input', e => planet.speed = parseFloat(e.target.value));

  label.appendChild(slider);
  ui.appendChild(label);
});

// Play/Pause
const playPauseBtn = document.createElement('button');
playPauseBtn.textContent = 'Pause';
ui.appendChild(playPauseBtn);
let isPaused = false;
playPauseBtn.onclick = () => {
  isPaused = !isPaused;
  playPauseBtn.textContent = isPaused ? 'Play' : 'Pause';
};

// Resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / (window.innerHeight - 60);
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight - 60);
});

// Drag rotation
let mouseX = 0, mouseY = 0, targetX = 0, targetY = 0, isDragging = false, isDraggingOnUI = false;
document.addEventListener('mousedown', e => { isDraggingOnUI = ui.contains(e.target); isDragging = !isDraggingOnUI; });
document.addEventListener('mouseup', () => isDragging = false);
document.addEventListener('mousemove', e => {
  if (isDragging) {
    mouseX = (e.clientX / window.innerWidth) * 2 - 1;
    mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
  }
});

// Zoom
let prevDistance = null, zoomSpeed = 0.1;
document.addEventListener('touchmove', e => {
  if (e.touches.length === 2) {
    const dx = e.touches[0].clientX - e.touches[1].clientX;
    const dy = e.touches[0].clientY - e.touches[1].clientY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (prevDistance !== null) {
      camera.position.z -= (dist - prevDistance) * zoomSpeed;
      camera.position.z = THREE.MathUtils.clamp(camera.position.z, 20, 150);
    }
    prevDistance = dist;
  }
});
document.addEventListener('wheel', e => {
  camera.position.z += e.deltaY * 0.05;
  camera.position.z = THREE.MathUtils.clamp(camera.position.z, 20, 150);
});
document.addEventListener('touchend', e => {
  if (e.touches.length < 2) prevDistance = null;
});

// Theme Toggle
document.getElementById('themeToggle').onclick = () => {
  const isDark = document.body.style.background === '#000' || !document.body.style.background;
  document.body.style.background = isDark ? '#fff' : '#000';
  ui.style.background = isDark ? '#ddd' : '#111';
  ui.style.color = isDark ? '#000' : '#fff';
};

// Animate
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

    if (planet.moon) {
      planet.moon.angle += 0.03;
      const moonDist = 1.5;
      planet.moon.mesh.position.set(
        planet.mesh.position.x + Math.cos(planet.moon.angle) * moonDist,
        0,
        planet.mesh.position.z + Math.sin(planet.moon.angle) * moonDist
      );
    }

    if (planet.ring) {
      planet.ring.position.copy(planet.mesh.position);
    }
  });

  targetX += (mouseX - targetX) * 0.05;
  targetY += (mouseY - targetY) * 0.05;
  camera.position.x = targetX * 30;
  camera.position.y = 5 + targetY * 10;
  camera.lookAt(0, 0, 0);

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
