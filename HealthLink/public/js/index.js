const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('bgCanvas'), alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Bigger Medical Cross Geometry
const crossShape = new THREE.Shape();
crossShape.moveTo(-4, 2);
crossShape.lineTo(-2, 2);
crossShape.lineTo(-2, 4);
crossShape.lineTo(2, 4);
crossShape.lineTo(2, 2);
crossShape.lineTo(4, 2);
crossShape.lineTo(4, -2);
crossShape.lineTo(2, -2);
crossShape.lineTo(2, -4);
crossShape.lineTo(-2, -4);
crossShape.lineTo(-2, -2);
crossShape.lineTo(-4, -2);
crossShape.lineTo(-4, 2);

const extrudeSettings = { depth: 2, bevelEnabled: false };
const crossGeometry = new THREE.ExtrudeGeometry(crossShape, extrudeSettings);

// Blue Theme Material
const crossMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x007bff, // Main Blue Color
    emissive: 0x0044aa, // Light Blue Glow
    metalness: 0.7, 
    roughness: 0.3 
});

const crossMesh = new THREE.Mesh(crossGeometry, crossMaterial);
crossMesh.position.set(0, 0, 0);
scene.add(crossMesh);

// Lights
const pointLight = new THREE.PointLight(0xffffff, 1.5);
pointLight.position.set(10, 10, 10);
scene.add(pointLight);

const ambientLight = new THREE.AmbientLight(0x404040, 1);
scene.add(ambientLight);

// Floating Particles
const particleGeometry = new THREE.BufferGeometry();
const particleCount = 400;
const positions = new Float32Array(particleCount * 3);
for (let i = 0; i < particleCount * 3; i++) {
    positions[i] = (Math.random() - 0.5) * 150;
}
particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
const particleMaterial = new THREE.PointsMaterial({ color: 0x00ffff, size: 0.4 });
const particles = new THREE.Points(particleGeometry, particleMaterial);
scene.add(particles);

camera.position.z = 30;

function animate() {
    requestAnimationFrame(animate);
    crossMesh.rotation.y += 0.008;
    crossMesh.rotation.x += 0.004;
    particles.rotation.y += 0.0005;
    renderer.render(scene, camera);
}
animate();

// Handle Window Resize
window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
