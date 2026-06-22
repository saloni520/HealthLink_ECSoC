// 3D Scene Setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: document.querySelector("#bg"), alpha: true });

renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.set(0, 0, 5);

// Lights
const light = new THREE.AmbientLight(0x888888);
scene.add(light);
const pointLight = new THREE.PointLight(0xffffff, 1);
pointLight.position.set(2, 3, 4);
scene.add(pointLight);

// Load 3D Models (Basic Spheres as Placeholder for Healthcare Symbols)
const geometry = new THREE.SphereGeometry(0.5, 32, 32);
const material1 = new THREE.MeshStandardMaterial({ color: 0x00ffff, wireframe: true });
const material2 = new THREE.MeshStandardMaterial({ color: 0xff00ff, wireframe: true });

const stethoscope = new THREE.Mesh(geometry, material1);
const heartbeat = new THREE.Mesh(geometry, material2);
const dnaHelix = new THREE.Mesh(geometry, material1);

stethoscope.position.set(-2, 0, 0);
heartbeat.position.set(0, 2, -1);
dnaHelix.position.set(2, -1, 0);

scene.add(stethoscope, heartbeat, dnaHelix);

// Animate Objects
gsap.to(stethoscope.rotation, { y: Math.PI * 2, duration: 5, repeat: -1, ease: "power1.inOut" });
gsap.to(heartbeat.rotation, { x: Math.PI * 2, duration: 6, repeat: -1, ease: "power1.inOut" });
gsap.to(dnaHelix.rotation, { y: -Math.PI * 2, duration: 4, repeat: -1, ease: "power1.inOut" });

// Mouse Interactivity
document.addEventListener("mousemove", (event) => {
    let x = (event.clientX / window.innerWidth) * 2 - 1;
    let y = -(event.clientY / window.innerHeight) * 2 + 1;
    gsap.to(camera.position, { x: x * 2, y: y * 2, duration: 1 });
});

// Animation Loop
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
animate();

//chat
document.addEventListener("DOMContentLoaded", function() {
    const aiBtn = document.getElementById("ai-analysis-btn");
    const popup = document.getElementById("ai-popup");
    const closeBtn = document.getElementById("close-popup");
    const analyzeBtn = document.getElementById("analyze-btn");
    const messageBox = document.getElementById("health-message");
    const reportInput = document.getElementById("health-report");
    const responseBox = document.getElementById("ai-response");

    // Open Popup
    aiBtn.addEventListener("click", () => {
        popup.style.display = "block";
    });

    // Close Popup
    closeBtn.addEventListener("click", () => {
        popup.style.display = "none";
    });

    // Analyze Message & Report (API Call)
    analyzeBtn.addEventListener("click", async () => {
        const message = messageBox.value;
        const report = reportInput.files[0];

        if (!message && !report) {
            responseBox.innerText = "Please enter a message or upload a report.";
            return;
        }

        responseBox.innerText = "Processing...";

        try {
            const response = await fetch("/analyze-health", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message }),
            });

            const data = await response.json();
            responseBox.innerText = data.reply || "AI Analysis Complete.";
        } catch (error) {
            responseBox.innerText = "Error processing request.";
        }
    });
});

