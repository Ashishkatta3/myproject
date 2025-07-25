import * as THREE from 'https://cdn.skypack.dev/three@0.150.1';
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.150.1/examples/jsm/controls/OrbitControls.js';

const canvas = document.getElementById('globe-canvas');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(window.innerWidth, window.innerHeight);

const geometry = new THREE.SphereGeometry(1, 64, 64);
const texture = new THREE.TextureLoader().load('https://raw.githubusercontent.com/jeromeetienne/threex.planets/master/images/earthmap1k.jpg');
const material = new THREE.MeshStandardMaterial({ map: texture });
const earth = new THREE.Mesh(geometry, material);
scene.add(earth);

const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 3, 5);
scene.add(light);

camera.position.z = 3;
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableZoom = false;
controls.enablePan = false;

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();

const overlay = document.getElementById('overlay');
const inputBox = document.getElementById('input-box');
const label = document.getElementById('input-label');

const nationalities = ["American", "Indian", "Chinese", "Brazilian", "Nigerian", "French"];
const continents = ["Africa", "Asia", "Europe", "North America", "South America", "Oceania"];
const continentCountries = {
  "Africa": ["Nigeria", "Egypt", "South Africa", "Kenya"],
  "Asia": ["India", "China", "Japan", "Thailand"],
  "Europe": ["France", "Germany", "Italy", "Spain"],
  "North America": ["USA", "Canada", "Mexico"],
  "South America": ["Brazil", "Argentina", "Colombia"],
  "Oceania": ["Australia", "New Zealand", "Fiji"]
};

let step = 0;

function populateOptions(options) {
  inputBox.innerHTML = '';
  options.forEach(opt => {
    const option = document.createElement('option');
    option.value = opt;
    option.textContent = opt;
    inputBox.appendChild(option);
  });
}

populateOptions(nationalities);

inputBox.addEventListener('change', () => {
  if (step === 0) {
    step = 1;
    label.textContent = "Which continent do you want to travel to?";
    populateOptions(continents);
  } else if (step === 1) {
    const selectedContinent = inputBox.value;
    label.textContent = `Choose a country in ${selectedContinent}`;
    populateOptions(continentCountries[selectedContinent]);
    panToContinent(selectedContinent);
    step = 2;
  } else if (step === 2) {
    const selectedCountry = inputBox.value;
    window.location.href = `country.html?name=${encodeURIComponent(selectedCountry)}`;
  }
});

const continentCoords = {
  "Africa": [0, 20],
  "Asia": [35, 100],
  "Europe": [50, 10],
  "North America": [40, -100],
  "South America": [-15, -60],
  "Oceania": [-25, 140]
};

function latLonToVector3(lat, lon, radius = 1) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

function panToContinent(continent) {
  const [lat, lon] = continentCoords[continent];
  const target = latLonToVector3(lat, lon);
  const spherical = new THREE.Spherical().setFromVector3(target);
  earth.rotation.y = -spherical.theta;
  earth.rotation.x = spherical.phi - Math.PI / 2;
}
