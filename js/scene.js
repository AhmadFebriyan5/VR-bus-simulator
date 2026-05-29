// ─── scene.js ─────────────────────────────────────────────────────
// Setup Renderer, Scene, Camera, Pencahayaan, dan State Global Simulator

// ─── SETUP RENDERER & WEBXR ───────────────────────────────────────
const W = window.innerWidth, H = window.innerHeight - 60;
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('c'), antialias: true });
renderer.setSize(W, H);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.xr.enabled = true;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);
scene.fog = new THREE.Fog(0x87ceeb, 60, 200);

const camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 300);
scene.add(camera); // Agar objek anak (gaze reticle) dapat dirender

// ─── GAZE RETICLE UNTUK VR ────────────────────────────────────────
const reticleGeo = new THREE.RingGeometry(0.012, 0.018, 32);
const reticleMat = new THREE.MeshBasicMaterial({
  color: 0xe8d44d,
  depthTest: false,
  transparent: true,
  opacity: 0.9
});
const reticle = new THREE.Mesh(reticleGeo, reticleMat);
reticle.position.z = -1;
camera.add(reticle);

// ─── PENCAHAYAAN ──────────────────────────────────────────────────
const ambient = new THREE.AmbientLight(0xffeedd, 0.7);
scene.add(ambient);

const sun = new THREE.DirectionalLight(0xfff5e0, 1.4);
sun.position.set(30, 60, 20);
sun.castShadow = true;
sun.shadow.mapSize.set(1024, 1024);
sun.shadow.camera.far = 200;
sun.shadow.camera.left = -80; sun.shadow.camera.right = 80;
sun.shadow.camera.top = 80; sun.shadow.camera.bottom = -80;
scene.add(sun);

// ─── STATE SIMULATOR ──────────────────────────────────────────────
let engineOn = false, doorOpen = false, headlights = false;
let speed = 0, gear = 1; // 0: R, 1: N, 2: D1, 3: D2, 4: D3, 5: D4, 6: D5
const gearNames = ['R', 'N', 'D1', 'D2', 'D3', 'D4', 'D5'];
let passengers = 0, totalDist = 0;
let busX = 0, busZ = -120, busAngle = 0;
let camMode = 0; // 0: Supir (VR default), 1: Belakang, 2: Samping, 3: Atas
const camModes = ['Pengemudi', 'Belakang Luar', 'Samping', 'Atas'];
const keys = {};

document.addEventListener('keydown', e => { keys[e.key] = true; });
document.addEventListener('keyup',   e => { keys[e.key] = false; });

// ─── HELPER MATERIAL ──────────────────────────────────────────────
function mat(color, opts) {
  return new THREE.MeshLambertMaterial({ color, ...opts });
}
