import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

// Setup scene, camera, renderer
const container = document.getElementById('container');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, window.innerWidth/window.innerHeight, 0.1, 1000);
camera.position.set(0, 5, 60);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight - 60);
container.appendChild(renderer.domElement);

// Lighting
const light = new THREE.PointLight(0xffffff, 40, 300);
light.position.set(0, 0, 20);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(light);
scene.add(ambientLight);

// Sun (yellow emissive sphere)
const sunGeo = new THREE.SphereGeometry(3, 32, 32);
const textureLoader = new THREE.TextureLoader();
const sunTexture = textureLoader.load('2k_sun.jpg');
const sunMat = new THREE.MeshBasicMaterial({
  map: sunTexture
});
const sun = new THREE.Mesh(sunGeo, sunMat);
scene.add(sun);

// Planet data (name, size, distance from sun)
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

// Planet texture URLs
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

const planets = [];

planetsData.forEach(data => {
  const geo = new THREE.SphereGeometry(data.size, 32, 32);

  // Load texture for planet
  const texture = textureLoader.load(planetTextures[data.name]);

  const mat = new THREE.MeshStandardMaterial({ map: texture });
  const mesh = new THREE.Mesh(geo, mat);
  scene.add(mesh);

  planets.push({ ...data, mesh, angle: Math.random() * Math.PI * 2, speed: 0.01 });

  // Orbit trajectory
  const orbitRadius = data.distance;
  const orbitCurve = new THREE.EllipseCurve(
    0, 0,
    orbitRadius, orbitRadius,
    0, 2 * Math.PI,
    false,
    0
  );

  const orbitPoints = orbitCurve.getPoints(100);
  const orbitGeometry = new THREE.BufferGeometry().setFromPoints(
    orbitPoints.map(p => new THREE.Vector3(p.x, 0, p.y))
  );
  const orbitMaterial = new THREE.LineBasicMaterial({ color: 0x888888 });
  const orbitLine = new THREE.LineLoop(orbitGeometry, orbitMaterial);
  scene.add(orbitLine);

  // Add Saturn's ring with tilt
  if(data.name === 'Saturn') {
    const ringGeometry = new THREE.RingGeometry(data.size * 1.2, data.size * 2, 64);
    ringGeometry.rotateX(- Math.PI / 2);

    const ringTexture = textureLoader.load('saturn_ring.png'); // Make sure you have this texture file
    const ringMaterial = new THREE.MeshStandardMaterial({
      map: ringTexture,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.7,
    });

    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    // Tilt the ring ~25 degrees (0.44 radians)
    ring.rotation.x = 0.44;

    // Initially position ring at Saturn's position
    ring.position.copy(mesh.position);
    scene.add(ring);

    planets[planets.length - 1].ring = ring; // save ring reference
  }
});

// Orbit speed controls UI
const ui = document.getElementById('ui');

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

// Responsive resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / (window.innerHeight - 60);
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight - 60);
});

// Adding stars
function addstar(){
  const geometry = new THREE.SphereGeometry(0.2, 24, 24);
  const material= new THREE.MeshStandardMaterial({ color: 0xffffff });
  const star = new THREE.Mesh(geometry, material);

  const [x, y, z] = Array(3).fill().map(() => THREE.MathUtils.randFloatSpread(100));
  star.position.set(x, y, z);
  scene.add(star);
}

Array(1000).fill().forEach(addstar);

// Variables for camera movement on mouse drag
let mouseX = 0;
let mouseY = 0;
let targetX = 0;
let targetY = 0;
let isDragging = false;
let isDraggingOnUI = false;

document.addEventListener('mousedown', (event) => {
  // Check if mouse down is inside UI, if yes, don't drag camera
  if (ui.contains(event.target)) {
    isDraggingOnUI = true;
    isDragging = false;
  } else {
    isDraggingOnUI = false;
    isDragging = true;
  }
});

document.addEventListener('mouseup', () => {
  isDragging = false;
  isDraggingOnUI = false;
});

document.addEventListener('mousemove', (event) => {
  if (isDragging && !isDraggingOnUI) {
    mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    mouseY = - (event.clientY / window.innerHeight) * 2 + 1;
  }
});

// Animate planets orbiting and rotating
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

    // Update ring position for Saturn if ring exists
    if (planet.ring) {
      planet.ring.position.copy(planet.mesh.position);
      planet.ring.rotation.x = 0.44;
    }
  });

  // Smooth camera movement towards mouse drag target
  targetX += (mouseX - targetX) * 0.05;
  targetY += (mouseY - targetY) * 0.05;

  camera.position.x = targetX * 30;
  camera.position.y = 5 + targetY * 10;
  camera.lookAt(0, 0, 0);

  renderer.render(scene, camera);
}

animate();
