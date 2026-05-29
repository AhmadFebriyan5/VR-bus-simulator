// ─── controls.js ──────────────────────────────────────────────────
// Logika Kontrol: Mesin, Gigi, Klakson, Pintu, Lampu, Kamera, Keyboard

function toggleEngine() {
  engineOn = !engineOn;
  document.getElementById('btn-engine').classList.toggle('active', engineOn);
  showMsg(engineOn ? 'Mesin HIDUP (Breem!) - Siap jalan!' : 'Mesin MATI');
  if (!engineOn) { speed = 0; gear = 1; updateGearDisplay(); }
}

function honk() {
  showMsg('📢 TELOLET BASURI: Telolet.. Telolet..!! 🎉');
}

function openDoor() {
  if (Math.abs(speed) > 3 && !doorOpen) {
    showMsg('Peringatan: Bus harus berhenti untuk membuka pintu!');
    return;
  }
  doorOpen = !doorOpen;
  document.getElementById('btn-door').classList.toggle('active', doorOpen);

  const doorMesh = busGroup.getObjectByName('busDoor');
  if (doorMesh) {
    doorMesh.position.z = doorOpen ? 1.6 : 2.4;
  }

  if (doorOpen) {
    showMsg('Pintu Terbuka - Menanti warga Palembang naik...');
    setTimeout(() => {
      if (doorOpen) {
        const boarding = Math.floor(Math.random() * 6);
        passengers += boarding;
        document.getElementById('h-pass').textContent = 'PENUMPANG: ' + passengers;
        if (boarding > 0) showMsg('👍 ' + boarding + ' orang naik bus. Penumpang: ' + passengers);
        else showMsg('Halte ini kosong, lanjut jalan!');
      }
    }, 1500);
  } else {
    showMsg('Pintu Tertutup Rapat.');
  }
}

function toggleLight() {
  headlights = !headlights;
  headlightL.intensity = headlights ? 3.0 : 0;
  headlightR.intensity = headlights ? 3.0 : 0;

  scene.background = new THREE.Color(headlights ? 0x050c18 : 0x87ceeb);
  scene.fog = new THREE.Fog(headlights ? 0x050c18 : 0x87ceeb, 60, headlights ? 110 : 200);
  roadLights.forEach(pl => { pl.intensity = headlights ? 0.75 : 0; });

  document.getElementById('btn-light').classList.toggle('active', headlights);
  showMsg('Lampu Utama: ' + (headlights ? 'ON (Malam)' : 'OFF (Siang)'));
}

function shiftGear(dir) {
  if (!engineOn) { showMsg('Hidupkan mesin terlebih dahulu! (Tekan E)'); return; }
  gear = Math.max(0, Math.min(6, gear + dir));
  if (gear === 0 && speed > 5) { showMsg('Gagal! Rem dulu sebelum mundur.'); gear = 1; return; }
  updateGearDisplay();
}

function updateGearDisplay() {
  const gn = gearNames[gear];
  document.getElementById('gear').innerHTML = gn + '<br><span id="gear-label">GIGI</span>';
  document.getElementById('h-gear').textContent = 'GIGI: ' + gn;
  showMsg('Transmisi: GIGI ' + gn);
}

function changeCam() {
  camMode = (camMode + 1) % camModes.length;
  showMsg('Tampilan: ' + camModes[camMode]);
}

// ─── PINTASAN KEYBOARD ────────────────────────────────────────────
document.addEventListener('keydown', e => {
  switch (e.key.toLowerCase()) {
    case 'e': toggleEngine(); break;
    case 'h': honk();        break;
    case 'f': openDoor();    break;
    case 'l': toggleLight(); break;
    case 'c': changeCam();   break;
  }
});
