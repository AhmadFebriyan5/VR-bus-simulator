
const W = window.innerWidth;
const H = window.innerHeight;

const renderer = new THREE.WebGLRenderer({
  canvas: document.getElementById('c'),
  antialias: true
});

renderer.setSize(W, H);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);

const camera = new THREE.PerspectiveCamera(
  60,
  W / H,
  0.1,
  300
);

camera.position.set(0, 3, -10);

const ambient = new THREE.AmbientLight(0xffffff, 0.8);
scene.add(ambient);

const sun = new THREE.DirectionalLight(0xffffff, 1);
sun.position.set(10, 20, 10);
scene.add(sun);
