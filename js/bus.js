// ─── bus.js ───────────────────────────────────────────────────────
// Model Bus Trans Musi, Dasbor VR Interaktif 3D, dan Lampu Depan

const busGroup = new THREE.Group();
scene.add(busGroup);

const vrDashboard = new THREE.Group();
vrDashboard.position.set(0, 0, 0);
busGroup.add(vrDashboard);

const vrInteractiveButtons = [];

function buildBus() {
  // Badan Utama (Khas Trans Musi Biru & Putih)
  const bodyLower = new THREE.Mesh(new THREE.BoxGeometry(3, 1.0, 8), mat(0x0044cc));
  bodyLower.position.y = 1.0; bodyLower.castShadow = true;
  busGroup.add(bodyLower);

  const bodyUpper = new THREE.Mesh(new THREE.BoxGeometry(3, 1.0, 7.8), mat(0xf0f0f0));
  bodyUpper.position.set(0, 1.8, -0.1); bodyUpper.castShadow = true;
  busGroup.add(bodyUpper);

  // Atap Bus
  const roof = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.2, 7.6), mat(0xd0d0d0));
  roof.position.y = 2.4;
  busGroup.add(roof);

  // Kaca Depan
  const windshield = new THREE.Mesh(
    new THREE.BoxGeometry(2.8, 1.1, 0.1),
    mat(0x99ddff, { transparent: true, opacity: 0.4 })
  );
  windshield.position.set(0, 1.85, 3.85);
  busGroup.add(windshield);

  // Kursi Pengemudi
  const seatBase = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.4, 0.5), mat(0x222222));
  seatBase.position.set(-0.6, 0.7, 3.1);
  busGroup.add(seatBase);
  const seatBack = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.8, 0.1), mat(0x333333));
  seatBack.position.set(-0.6, 1.3, 2.85);
  busGroup.add(seatBack);

  // ─── DASBOR VR INTERAKTIF 3D DI DALAM KABIN ───────────────────
  const dashPanel = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.35, 0.5), mat(0x1a1a1a));
  dashPanel.position.set(-0.4, 0.95, 3.6);
  dashPanel.rotation.x = -Math.PI / 12;
  vrDashboard.add(dashPanel);

  // Setir (Dapat Berputar)
  const steeringWheelGeo = new THREE.TorusGeometry(0.2, 0.03, 8, 24);
  const steeringWheel = new THREE.Mesh(steeringWheelGeo, mat(0x111111));
  steeringWheel.name = "steering";
  steeringWheel.position.set(-0.6, 1.15, 3.45);
  steeringWheel.rotation.x = Math.PI / 4;
  vrDashboard.add(steeringWheel);

  // Tombol 3D: MESIN (Merah)
  const btnEngine = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.06, 12), mat(0xcc2222));
  btnEngine.position.set(-1.0, 1.05, 3.55);
  btnEngine.rotation.x = Math.PI / 4;
  btnEngine.userData = { action: 'engine', label: 'MESIN' };
  vrDashboard.add(btnEngine);
  vrInteractiveButtons.push(btnEngine);

  // Tombol 3D: GIGI + (Hijau)
  const btnGearUp = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.06, 12), mat(0x22cc22));
  btnGearUp.position.set(-0.2, 1.05, 3.55);
  btnGearUp.rotation.x = Math.PI / 4;
  btnGearUp.userData = { action: 'gearUp', label: 'GIGI +' };
  vrDashboard.add(btnGearUp);
  vrInteractiveButtons.push(btnGearUp);

  // Tombol 3D: GIGI - (Kuning)
  const btnGearDown = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.06, 12), mat(0xcccc22));
  btnGearDown.position.set(-0.35, 1.05, 3.55);
  btnGearDown.rotation.x = Math.PI / 4;
  btnGearDown.userData = { action: 'gearDown', label: 'GIGI -' };
  vrDashboard.add(btnGearDown);
  vrInteractiveButtons.push(btnGearDown);

  // Tombol 3D: KLAKSON (Oranye)
  const btnHorn = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.06, 12), mat(0xcc6611));
  btnHorn.position.set(0.0, 1.05, 3.55);
  btnHorn.rotation.x = Math.PI / 4;
  btnHorn.userData = { action: 'horn', label: 'TELOLET' };
  vrDashboard.add(btnHorn);
  vrInteractiveButtons.push(btnHorn);

  // Tombol 3D: PINTU (Biru Muda)
  const btnDoor = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.06, 12), mat(0x2299cc));
  btnDoor.position.set(0.15, 1.05, 3.55);
  btnDoor.rotation.x = Math.PI / 4;
  btnDoor.userData = { action: 'door', label: 'PINTU' };
  vrDashboard.add(btnDoor);
  vrInteractiveButtons.push(btnDoor);

  // Jendela Samping Penumpang
  for (let i = -2; i <= 2; i++) {
    [-1.51, 1.51].forEach(sx => {
      const win = new THREE.Mesh(
        new THREE.BoxGeometry(0.04, 0.75, 1.1),
        mat(0x99ddff, { transparent: true, opacity: 0.45 })
      );
      win.position.set(sx, 1.8, i * 1.35 - 0.2);
      busGroup.add(win);
    });
  }

  // Pintu Geser Otomatis
  const door = new THREE.Mesh(
    new THREE.BoxGeometry(0.05, 1.5, 0.95),
    mat(0xffdd33, { transparent: true, opacity: 0.5 })
  );
  door.position.set(1.52, 1.1, 2.4);
  door.name = "busDoor";
  busGroup.add(door);

  // Lampu Depan
  const hGeo = new THREE.BoxGeometry(0.4, 0.25, 0.1);
  [-1.0, 1.0].forEach(x => {
    const h = new THREE.Mesh(hGeo, mat(0xffffaa));
    h.position.set(x, 1.0, 4.02);
    busGroup.add(h);
  });

  // Lampu Belakang Merah
  const tGeo = new THREE.BoxGeometry(0.4, 0.2, 0.1);
  [-1.0, 1.0].forEach(x => {
    const t = new THREE.Mesh(tGeo, mat(0xff2222));
    t.position.set(x, 0.9, -4.02);
    busGroup.add(t);
  });

  // Roda
  const wheelGeo = new THREE.CylinderGeometry(0.52, 0.52, 0.45, 16);
  wheelGeo.rotateZ(Math.PI / 2);
  const hubGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.47, 8);
  hubGeo.rotateZ(Math.PI / 2);

  const wheelPositions = [[-1.55, 0.52, 2.4], [1.55, 0.52, 2.4], [-1.55, 0.52, -2.4], [1.55, 0.52, -2.4]];
  wheelPositions.forEach((p, idx) => {
    const w = new THREE.Mesh(wheelGeo, mat(0x181818));
    w.position.set(...p); w.castShadow = true;
    w.name = "wheel_" + idx;
    busGroup.add(w);
    const hub = new THREE.Mesh(hubGeo, mat(0xbbbbbb));
    hub.position.set(...p);
    busGroup.add(hub);
  });

  // Bumper Depan & Belakang
  [4.02, -4.02].forEach(z => {
    const b = new THREE.Mesh(new THREE.BoxGeometry(3.06, 0.35, 0.2), mat(0x333333));
    b.position.set(0, 0.4, z);
    busGroup.add(b);
  });
}
buildBus();

// ─── LAMPU DEPAN (SPOTLIGHT) ──────────────────────────────────────
const headlightL = new THREE.SpotLight(0xfff8e0, 0, 45, Math.PI / 5, 0.5);
headlightL.position.set(-1, 1.0, 4.1);
headlightL.target.position.set(-1, 0, 25);
busGroup.add(headlightL); busGroup.add(headlightL.target);

const headlightR = new THREE.SpotLight(0xfff8e0, 0, 45, Math.PI / 5, 0.5);
headlightR.position.set(1, 1.0, 4.1);
headlightR.target.position.set(1, 0, 25);
busGroup.add(headlightR); busGroup.add(headlightR.target);

busGroup.position.set(0, 0, -120);
