// ─── world.js ─────────────────────────────────────────────────────
// Dunia: Jembatan Ampera, Jalan, Halte Bus, Gedung, Pohon, Lampu Jalan

// ─── JEMBATAN AMPERA PALEMBANG (IKONIK) ───────────────────────────
function buildAmperaBridge() {
  const amperaGroup = new THREE.Group();
  amperaGroup.position.set(0, 0, 0);

  const towerL = new THREE.Mesh(new THREE.BoxGeometry(2.2, 19, 2.2), mat(0xcc1111));
  towerL.position.set(-6.5, 9.5, 0); towerL.castShadow = true;
  amperaGroup.add(towerL);

  const towerR = new THREE.Mesh(new THREE.BoxGeometry(2.2, 19, 2.2), mat(0xcc1111));
  towerR.position.set(6.5, 9.5, 0); towerR.castShadow = true;
  amperaGroup.add(towerR);

  const beamTop = new THREE.Mesh(new THREE.BoxGeometry(15.2, 1.8, 1.8), mat(0xcc1111));
  beamTop.position.set(0, 17.5, 0);
  amperaGroup.add(beamTop);

  const beamMid = new THREE.Mesh(new THREE.BoxGeometry(15.2, 1.2, 1.2), mat(0xcc1111));
  beamMid.position.set(0, 11, 0);
  amperaGroup.add(beamMid);

  const weightL = new THREE.Mesh(new THREE.BoxGeometry(1.8, 4, 1.8), mat(0xaa1111));
  weightL.position.set(-6.5, 5, 0);
  amperaGroup.add(weightL);

  const weightR = new THREE.Mesh(new THREE.BoxGeometry(1.8, 4, 1.8), mat(0xaa1111));
  weightR.position.set(6.5, 5, 0);
  amperaGroup.add(weightR);

  // Kabel Baja Vertikal (Suspension Wires)
  const cableMat = mat(0xdddddd);
  for (let offsetZ = -15; offsetZ <= 15; offsetZ += 3) {
    if (offsetZ === 0) continue;
    [-5, 5].forEach(x => {
      const height = 8 - Math.abs(offsetZ) * 0.15;
      const cable = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, height), cableMat);
      cable.position.set(x, 0.2 + height / 2, offsetZ);
      amperaGroup.add(cable);
    });
  }

  const amperaSign = new THREE.Mesh(new THREE.BoxGeometry(4.5, 1.2, 0.3), mat(0xffcc00));
  amperaSign.position.set(0, 14.5, 1.0);
  amperaGroup.add(amperaSign);

  scene.add(amperaGroup);
}
buildAmperaBridge();

// ─── RUTE & MARKA JALAN RAYA ──────────────────────────────────────
const ROAD_LEN = 400;

const road = new THREE.Mesh(new THREE.PlaneGeometry(8, ROAD_LEN), mat(0x313131));
road.rotation.x = -Math.PI / 2; road.receiveShadow = true;
scene.add(road);

[-5.5, 5.5].forEach(x => {
  const sw = new THREE.Mesh(new THREE.PlaneGeometry(3, ROAD_LEN), mat(0x7c7c72));
  sw.rotation.x = -Math.PI / 2; sw.position.x = x; sw.receiveShadow = true;
  scene.add(sw);
});

[-37, 37].forEach(x => {
  const g = new THREE.Mesh(new THREE.PlaneGeometry(60, ROAD_LEN), mat(0x3e6b26));
  g.rotation.x = -Math.PI / 2; g.position.x = x;
  scene.add(g);
});

// Marka Tengah Jalan Putih Terputus
for (let i = -190; i < 200; i += 10) {
  const line = new THREE.Mesh(new THREE.PlaneGeometry(0.18, 4), mat(0xffffff));
  line.rotation.x = -Math.PI / 2; line.position.set(0, 0.02, i);
  scene.add(line);
}

// ─── HALTE BUS TRANS MUSI ─────────────────────────────────────────
const stops = [-90, -30, 40, 110];
const stopNames = ['Terminal Ampera', 'Halte Pasar Cinde', 'Halte RS Charitas', 'Terminal Jakabaring'];

stops.forEach((z) => {
  const base = new THREE.Mesh(new THREE.BoxGeometry(3, 0.25, 2.5), mat(0x9a9a90));
  base.position.set(6, 0.125, z);
  scene.add(base);

  [5, 7].forEach(x => {
    const col = new THREE.Mesh(new THREE.BoxGeometry(0.15, 2.6, 0.15), mat(0x555544));
    col.position.set(x, 1.3, z - 1.0);
    scene.add(col);
  });

  const sRoof = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.15, 2.8), mat(0x0055cc));
  sRoof.position.set(6, 2.6, z);
  scene.add(sRoof);

  const sign = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.6, 0.06), mat(0xffcc00));
  sign.position.set(6, 2.1, z - 1.05);
  scene.add(sign);
});

// ─── GEDUNG-GEDUNG KOTA PALEMBANG ─────────────────────────────────
const buildingData = [
  [-15, 30, 9, 8, 14, 0xcda27d], [-15, -15, 7, 6, 9, 0xbbaa99],
  [-16, 80, 11, 7, 18, 0x999988], [-15, -60, 8, 6, 11, 0xaab9b5],
  [-15, 120, 10, 8, 15, 0x958372], [-15, 160, 9, 7, 13, 0xd0c4b2],
  [15, 20, 10, 7, 12, 0x899cb0], [15, 60, 7, 6, 15, 0xb0a090],
  [15, 100, 11, 8, 20, 0x99aab5], [15, -30, 8, 6, 10, 0xaac0aa],
  [15, 140, 10, 7, 14, 0x91a1cb], [15, -90, 9, 6, 9, 0xb0c09d],
];

buildingData.forEach(([x, z, w, d, h, color]) => {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(color));
  mesh.position.set(x, h / 2, z); mesh.castShadow = true; mesh.receiveShadow = true;
  scene.add(mesh);

  for (let fi = 0; fi < Math.floor(h / 4); fi++) {
    for (let wi = 0; wi < Math.floor(w / 3.5); wi++) {
      const win = new THREE.Mesh(
        new THREE.BoxGeometry(0.7, 0.7, 0.05),
        mat(0xfff0c4, { transparent: true, opacity: 0.65 })
      );
      win.position.set(x - w / 2 + 1.6 + wi * 3.2, 2.0 + fi * 4, z + d / 2 + 0.04);
      scene.add(win);
    }
  }
});

// ─── POHON & PENGHIJAUAN JALAN ────────────────────────────────────
for (let z = -190; z < 200; z += 15) {
  [-8.5, 8.5].forEach(x => {
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.25, 2.2, 6), mat(0x604020));
    trunk.position.set(x, 1.1, z);
    scene.add(trunk);
    const crown = new THREE.Mesh(new THREE.ConeGeometry(1.3, 2.8, 6), mat(0x358435));
    crown.position.set(x, 3.4, z);
    scene.add(crown);
  });
}

// ─── TIANG LAMPU JALAN NEON ───────────────────────────────────────
const roadLights = [];
for (let z = -180; z < 200; z += 30) {
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 5.5, 6), mat(0x666666));
  pole.position.set(-4.5, 2.75, z);
  scene.add(pole);

  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.25, 8, 8), mat(0xfff9cc));
  bulb.position.set(-4.5, 5.6, z);
  scene.add(bulb);

  const pl = new THREE.PointLight(0xfff5aa, 0, 16);
  pl.position.set(-4.5, 5.5, z);
  scene.add(pl);
  roadLights.push(pl);
}
