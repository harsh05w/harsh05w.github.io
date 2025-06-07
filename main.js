   import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

    // Setup scene, camera, renderer
    const container = document.getElementById('container');
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth/window.innerHeight, 0.1, 1000);
    camera.position.set(0, 5,60);
    

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight - 60);
    container.appendChild(renderer.domElement);

    // Lighting
    const light = new THREE.PointLight(0xffffff, 40, 300);
    light.position.set(0, 0, 20);
    scene.add(light);

    // Sun (yellow emissive sphere)
    const sunGeo = new THREE.SphereGeometry(3, 32, 32);
    const sunMat = new THREE.MeshBasicMaterial({ color: 0xFFFF00 });
    const sun = new THREE.Mesh(sunGeo, sunMat);
    scene.add(sun);

    // Planet data (name, size, distance from sun, color)
    const planetsData = [
      { name: 'Mercury', size: 0.6, distance: 5, color: 0xd4c99c },
      { name: 'Venus', size: 1, distance: 7, color: 0xffcc88 },
      { name: 'Earth', size: 1.2, distance: 10, color: 0x3399ff },
      { name: 'Mars', size: 0.9, distance: 13, color: 0xff5533 },
      { name: 'Jupiter', size: 2.9, distance: 18, color: 0xffbb88 },
      { name: 'Saturn', size: 2, distance: 23, color: 0xffddaa },
      { name: 'Uranus', size: 1.7, distance: 27, color: 0x66ccff },
      { name: 'Neptune', size: 1.6, distance: 31, color: 0x3366ff },
    ];

    // Create planets
    const planets = [];
    planetsData.forEach(data => {
      const geo = new THREE.SphereGeometry(data.size, 32, 32);
      const mat = new THREE.MeshStandardMaterial({ color: data.color });
      const mesh = new THREE.Mesh(geo, mat);
      scene.add(mesh);
      planets.push({ ...data, mesh, angle: Math.random() * Math.PI * 2, speed: 0.01 });
      scene.add(mesh);

     // ADD THIS: trajectory line
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
  const orbitMaterial = new THREE.LineBasicMaterial({    color: 0x888888 });
  const orbitLine = new THREE.LineLoop(orbitGeometry,    orbitMaterial);
  scene.add(orbitLine);

});

    // Orbit speed controls
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

    // Animate planets orbiting and rotating
    function animate() {
      requestAnimationFrame(animate);

      planets.forEach(planet => {
        // Update angle by speed
        planet.angle += planet.speed;

        // Calculate position around sun
        planet.mesh.position.set(
          Math.cos(planet.angle) * planet.distance,
          0,
          Math.sin(planet.angle) * planet.distance
        );

        // Rotate planet on axis
        planet.mesh.rotation.y += 0.01;
      });

      renderer.render(scene, camera);
    }
    animate();