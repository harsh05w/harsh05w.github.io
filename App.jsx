import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import './style.css';

const planetData = [
  { name: 'Mercury', distance: 10, size: 0.5, speed: 0.04, texture:'/texture/mercury.jpg' },
  { name: 'Venus', distance: 15, size: 0.7, speed: 0.03, texture: '/texture/venus.jpg' },
  { name: 'Earth', distance: 20, size: 0.8, speed: 0.025, texture:'/texture/earth.jpg' },
  { name: 'Mars', distance: 25, size: 0.6, speed: 0.02, texture:'/texture/mars.jpg' },
  { name: 'Jupiter', distance: 32, size: 2.5, speed: 0.018, texture:'/texture/jupiter.jg' },
  { name: 'Saturn', distance: 40, size: 2.0, speed: 0.015,texture:'/texture/saturn.jpg' },
  { name: 'Uranus', distance: 47, size: 1.2, speed: 0.01, texture:'/texture/uranus.jpg' },
  { name: 'Neptune', distance: 55, size: 1.1, speed: 0.009, texture:'/texture/neptune.jpg' },
];

function App() {
  const mountRef = useRef(null);    
  const [speeds, setSpeeds] = useState(planetData.map(p => p.speed));

  useEffect(() => {
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 70;

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(width, height);
    mountRef.current.appendChild(renderer.domElement);

    const light = new THREE.PointLight(0xffffff, 1.5);
    light.position.set(0, 0, 0);
    scene.add(light);

    const sun = new THREE.Mesh(
      new THREE.SphereGeometry(4, 42, 42),
      new THREE.MeshBasicMaterial({ color: 0xffff00 })
    );
    scene.add(sun);

    const planets = planetData.map((p, i) => {
      const geometry = new THREE.SphereGeometry(p.size, 32, 32);
      const texture = new THREE.TextureLoader().load(p.texture);
      const material = new THREE.MeshStandardMaterial({ map: texture });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.x = p.distance;
      scene.add(mesh);
      return mesh;
    });

    const clock = new THREE.Clock();

    function animate() {
      requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      planets.forEach((planet, i) => {
        const angle = elapsed * speeds[i];
        const distance = planetData[i].distance;
        planet.position.x = Math.cos(angle) * distance;
        planet.position.z = Math.sin(angle) * distance;
      });

      renderer.render(scene, camera);
    }

    animate();

    return () => mountRef.current.removeChild(renderer.domElement);
  }, [speeds]);

  const handleSpeedChange = (index, newSpeed) => {
    const updatedSpeeds = [...speeds];
    updatedSpeeds[index] = parseFloat(newSpeed);
    setSpeeds(updatedSpeeds);
  };

  return (
    <div className="container">
      <div ref={mountRef} className="canvas-container" />
      <div className="controls">
        <h2>Orbital Speed Controls</h2>
        {planetData.map((p, i) => (
          <div key={p.name} className="slider-row">
            <label>{p.name}</label>
            <input
              type="range"
              min="0.001"
              max="0.1"
              step="0.001"
              value={speeds[i]}
              onChange={e => handleSpeedChange(i, e.target.value)}
            />
            <span>{speeds[i].toFixed(3)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;