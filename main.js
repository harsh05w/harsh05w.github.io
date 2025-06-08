import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

const container = document.getElementById('container');
const ui = document.getElementById('ui');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / (window.innerHeight - 60), 0.1, 1000);
camera.position.set(0, 5, 60);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight - 60);
container.appendChild(renderer.domElement);

// Background with starry skybox
const loader = new THREE.CubeTextureLoader();
const starCubeTexture = loader.load([
  '/Solar System Sim/Public/assets/stars.jpg',
  '/Solar System Sim/Public/assets/stars.jpg',
  '/Solar System Sim/Public/assets/stars.jpg',
  '/Solar System Sim/Public/assets/stars.jpg',
  '/Solar System Sim/Public/assets/stars.jpg',
  '/Solar System Sim/Public/assets/stars.jpg',
]);
scene.background = starCubeTexture;

// Add physical stars
const starGeometry = new THREE.BufferGeometry();
const starCount = 1000;
const starPositions = new Float32Array(starCount * 3);
for (let i = 0; i < starCount * 3; i++) {
  starPositions[i] = (Math.random() - 0.5) * 200;
}
starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
const starMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.5 });
const stars = new THREE.Points(starGeometry, starMaterial);
scene.add(stars);

// Lighting
const light = new THREE.PointLight(0xffffff, 40, 300);
light.position.set(0, 0, 20);
scene.add(light);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const textureLoader = new THREE.TextureLoader();
const sunTexture = textureLoader.load('/Solar System Sim/Public/assets/2k_sun.jpg');
const sun = new THREE.Mesh(
  new THREE.SphereGeometry(3, 32, 32),
  new THREE.MeshBasicMaterial({ map: sunTexture })
);
scene.add(sun);

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

const planetsData = [
  { name: 'Mercury', size: 0.6, distance: 5 },
  { name: 'Venus', size: 1, distance: 7 },
  { name: 'Earth', size: 1.2, distance: 10 },
  { name: 'Mars', size: 0.9, distance: 13 },
  { name: 'Jupiter', size: 2.9, distance: 17 },
  { name: 'Saturn', size: 2, distance: 27 },  // Increased distance from 26 to 27
  { name: 'Uranus', size: 1.7, distance: 30 },
  { name: 'Neptune', size: 1.6, distance: 34 },
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

  if (data.name === 'Earth') {
    const moonGeo = new THREE.SphereGeometry(0.3, 32, 32);
    const moonMat = new THREE.MeshStandardMaterial({
      map: textureLoader.load('/Solar System Sim/Public/assets/moon.jpg')
    });
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

// Asteroid belt between Jupiter and Saturn
const asteroidCount = 500;
for (let i = 0; i < asteroidCount; i++) {
  const asteroidGeo = new THREE.SphereGeometry(Math.random() * 0.15, 8, 8);
  const asteroidMat = new THREE.MeshStandardMaterial({ color: 0x888888 });
  const asteroid = new THREE.Mesh(asteroidGeo, asteroidMat);
  const angle = Math.random() * Math.PI * 2;
  const radius = 21 + Math.random() * 3; // between 21 and 24
  asteroid.position.set(Math.cos(angle) * radius, (Math.random() - 0.5) * 0.5, Math.sin(angle) * radius);
  scene.add(asteroid);
}

// UI sliders
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

const playPauseBtn = document.createElement('button');
playPauseBtn.id = 'playPauseBtn';
playPauseBtn.textContent = 'Pause';
ui.appendChild(playPauseBtn);

let isPaused = false;
playPauseBtn.addEventListener('click', () => {
  isPaused = !isPaused;
  playPauseBtn.textContent = isPaused ? 'Play' : 'Pause';
});

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / (window.innerHeight - 60);
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight - 60);
});

let mouseX = 0, mouseY = 0, targetX = 0, targetY = 0;
let isDragging = false;
let lastTouchX = 0, lastTouchY = 0;
let prevDistance = null;
const zoomSpeed = 0.1;

document.addEventListener('mousedown', e => {
  isDragging = !ui.contains(e.target);
});
document.addEventListener('mouseup', () => isDragging = false);
document.addEventListener('mousemove', e => {
  if (isDragging) {
    mouseX += (e.movementX || 0) / window.innerWidth;
    mouseY -= (e.movementY || 0) / window.innerHeight;
  }
});

document.addEventListener('touchstart', e => {
  if (e.touches.length === 1) {
    isDragging = true;
    lastTouchX = e.touches[0].clientX;
    lastTouchY = e.touches[0].clientY;
  }
});
document.addEventListener('touchmove', e => {
  if (isDragging && e.touches.length === 1) {
    const dx = e.touches[0].clientX - lastTouchX;
    const dy = e.touches[0].clientY - lastTouchY;
    mouseX += dx / window.innerWidth;
    mouseY -= dy / window.innerHeight;
    lastTouchX = e.touches[0].clientX;
    lastTouchY = e.touches[0].clientY;
  }
  if (e.touches.length === 2) {
    const dx = e.touches[0].clientX - e.touches[1].clientX;
    const dy = e.touches[0].clientY - e.touches[1].clientY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (prevDistance !== null) {
      const delta = distance - prevDistance;
      camera.position.z -= delta * zoomSpeed;
      camera.position.z = THREE.MathUtils.clamp(camera.position.z, 20, 150);
    }
    prevDistance = distance;
  }
}, { passive: false });

document.addEventListener('touchend', e => {
  if (e.touches.length === 0) {
    isDragging = false;
    prevDistance = null;
  }
});

document.addEventListener('wheel', e => {
  camera.position.z += e.deltaY * 0.05;
  camera.position.z = THREE.MathUtils.clamp(camera.position.z, 20, 150);
});

// Theme toggle
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

    if (planet.name === 'Earth' && planet.moon) {
      planet.moon.angle += 0.03;
      const moonDistance = 1.5;
      planet.moon.mesh.position.set(
        planet.mesh.position.x + Math.cos(planet.moon.angle) * moonDistance,
        0,
        planet.mesh.position.z + Math.sin(planet.moon.angle) * moonDistance
      );
    }

    if (planet.ring) {
      planet.ring.position.copy(planet.mesh.position);
      planet.ring.rotation.x = 0.44;
    }
  });

  targetX += (mouseX - targetX) * 0.05;
  targetY += (mouseY - targetY) * 0.05;
  targetX = THREE.MathUtils.clamp(targetX, -2, 2);
  targetY = THREE.MathUtils.clamp(targetY, -1.5, 1.5);

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
