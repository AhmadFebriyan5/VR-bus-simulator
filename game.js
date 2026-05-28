function drawSpeedometer(spd) {
  spCtx.clearRect(0, 0, 110, 110);
  spCtx.beginPath();
  spCtx.arc(55, 55, 48, 0, Math.PI * 2);
  spCtx.fillStyle = 'rgba(10,8,5,0.9)';
  spCtx.fill();
  spCtx.strokeStyle = '#e8d44d66';
  spCtx.lineWidth = 2;
  spCtx.stroke();

  for (let i = 0; i <= 10; i++) {
    const ang = (Math.PI * 0.75) + (i / 10) * (Math.PI * 1.5);
    spCtx.beginPath();
    spCtx.moveTo(55 + Math.cos(ang) * 36, 55 + Math.sin(ang) * 36);
    spCtx.lineTo(55 + Math.cos(ang) * 44, 55 + Math.sin(ang) * 44);
    spCtx.strokeStyle = '#e8d44d77';
    spCtx.lineWidth = i % 5 === 0 ? 2 : 1;
    spCtx.stroke();
  }

  const pct = Math.min(Math.abs(spd) / 90, 1);
  const ang = (Math.PI * 0.75) + pct * (Math.PI * 1.5);
  spCtx.beginPath();
  spCtx.moveTo(55, 55);
  spCtx.lineTo(55 + Math.cos(ang) * 37, 55 + Math.sin(ang) * 37);
  spCtx.strokeStyle = spd > 70 ? '#ff3333' : '#e8d44d';
  spCtx.lineWidth = 3;
  spCtx.stroke();

  spCtx.beginPath();
  spCtx.arc(55, 55, 4, 0, Math.PI * 2);
  spCtx.fillStyle = '#e8d44d';
  spCtx.fill();

  spCtx.fillStyle = '#e8d44d';
  spCtx.font = 'bold 15px monospace';
  spCtx.textAlign = 'center';
  spCtx.fillText(Math.round(Math.abs(spd)), 55, 72);
  spCtx.font = '9px monospace';
  spCtx.fillStyle = '#e8d44d88';
  spCtx.fillText('km/h', 55, 83);
}

// ─── FITUR LOGIKA INTERAKSI & HUD ──────────────────────────────────
let msgTimer = null;
function showMsg(text) {
  const el = document.getElementById('msg');
  el.textContent = text;
  el.style.opacity = '1';
  clearTimeout(msgTimer);
  msgTimer = setTimeout(() => el.style.opacity = '0', 2500);
}

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
    // Animasi geser sederhana ke belakang
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
  
  // Ubah Langit Palembang (Siang vs Malam Gelap Bernuansa Neon)
  scene.background = new THREE.Color(headlights ? 0x050c18 : 0x87ceeb);
  scene.fog = new THREE.Fog(headlights ? 0x050c18 : 0x87ceeb, 60, headlights ? 110 : 200);
  
  // Nyalakan lampu tiang jalan
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

// Pintasan Keyboard
document.addEventListener('keydown', e => {
  switch(e.key.toLowerCase()) {
    case 'e': toggleEngine(); break;
    case 'h': honk(); break;
    case 'f': openDoor(); break;
    case 'l': toggleLight(); break;
    case 'c': changeCam(); break;
  }
});

// ─── LOGIKA PEMROSESAN INTERAKSI TATAP (GAZE INTERACTION FOR VR) ───
const raycaster = new THREE.Raycaster();
const screenCenter = new THREE.Vector2(0, 0); // Titik pusat pandangan
let currentGazedBtn = null;
let gazeTimer = 0;
const GAZE_LIMIT = 1.5; // Butuh 1.5 detik memandang untuk aktivasi

function processGaze(dt) {
  // Hanya aktif jika berada di mode kamera supir (CamMode 0 / Saat VR berjalan)
  if (camMode !== 0) {
    reticle.visible = false;
    document.getElementById('vrgaze-hint').style.display = 'none';
    return;
  }
  
  reticle.visible = true;
  document.getElementById('vrgaze-hint').style.display = renderer.xr.isPresenting ? 'block' : 'none';

  raycaster.setFromCamera(screenCenter, camera);
  const intersects = raycaster.intersectObjects(vrInteractiveButtons);

  if (intersects.length > 0) {
    const hitObj = intersects[0].object;
    
    // Animasi sedikit membesar saat ditatap
    hitObj.scale.set(1.2, 1.2, 1.2);

    if (currentGazedBtn !== hitObj) {
      currentGazedBtn = hitObj;
      gazeTimer = 0;
    } else {
      gazeTimer += dt;
      
      // Perkecil ukuran reticle kursor sebagai indikasi loading tatapan
      const progress = Math.min(gazeTimer / GAZE_LIMIT, 1);
      reticle.scale.setScalar(1.0 - progress * 0.6);

      if (gazeTimer >= GAZE_LIMIT) {
        // Eksekusi aksi tombol 3D
        const action = hitObj.userData.action;
        triggerAction(action);
        gazeTimer = 0; // reset
        reticle.scale.setScalar(1);
      }
    }
  } else {
    // Kembalikan tombol ke skala normal jika tidak ditatap
    vrInteractiveButtons.forEach(btn => btn.scale.set(1, 1, 1));
    currentGazedBtn = null;
    gazeTimer = 0;
    reticle.scale.setScalar(1);
  }
}

function triggerAction(action) {
  if (action === 'engine') toggleEngine();
  else if (action === 'gearUp') shiftGear(1);
  else if (action === 'gearDown') shiftGear(-1);
  else if (action === 'horn') honk();
  else if (action === 'door') openDoor();
}

// ─── MANAJEMEN WEBXR (ENTER / EXIT VR) ────────────────────────────
let xrSession = null;
const vrBtn = document.getElementById('vr-btn');

if (navigator.xr) {
  navigator.xr.isSessionSupported('immersive-vr').then(supported => {
    if (supported) {
      vrBtn.addEventListener('click', onVRClick);
    } else {
      vrBtn.textContent = '[ NO HEADSET ]';
    }
  });
} else {
  vrBtn.textContent = '[ WEBXR N/A ]';
}

function onVRClick() {
  if (xrSession === null) {
    navigator.xr.requestSession('immersive-vr', {
      optionalFeatures: ['local-floor', 'bounded-floor']
    }).then(onSessionStarted);
  } else {
    xrSession.end();
  }
}

function onSessionStarted(session) {
  xrSession = session;
  session.addEventListener('end', onSessionEnded);
  renderer.xr.setSession(session);
  
  vrBtn.textContent = '[ KELUAR VR ]';
  vrBtn.classList.add('active');
  
  camMode = 0; // Paksa kamera ke pandangan Supir (VR First Person)
  showMsg('Masuk ke VR Mode! Tatap tombol dasbor 3D untuk kendali penuh.');
}

function onSessionEnded() {
  xrSession.removeEventListener('end', onSessionEnded);
  xrSession = null;
  
  vrBtn.textContent = '[ MASUK VR ]';
  vrBtn.classList.remove('active');
  showMsg('Keluar dari VR Mode.');
}

// ─── LOOP ANIMASI UTAMA SIMULATOR ─────────────────────────────────
let lastFrameTime = performance.now();

function gameLoop(now) {
  const dt = Math.min((now - lastFrameTime) / 1000, 0.05);
  lastFrameTime = now;

  // Fisika Pergerakan Bus
  if (engineOn) {
    const limitSpd = gear === 0 ? -16 : gear === 1 ? 0 : (gear - 1) * 16;

    if (keys['ArrowUp'] || keys['w']) {
      if (gear >= 2) {
        const accelPower = (gear - 1) * 5.5;
        speed = Math.min(speed + accelPower * dt, limitSpd);
      }
    } else if (keys['ArrowDown'] || keys['s']) {
      if (gear === 0) {
        speed = Math.max(speed - 6 * dt, -16);
      } else {
        speed = Math.max(speed - 15 * dt, 0); // Rem kuat
      }
    } else {
      // Hambatan Udara / Gesekan Ban Alami
      speed *= (1 - 0.9 * dt);
      if (Math.abs(speed) < 0.1) speed = 0;
    }
  } else {
    speed *= (1 - 1.8 * dt);
    if (Math.abs(speed) < 0.05) speed = 0;
  }

  // Kendali Kemudi (Setir)
  const turnFactor = 0.016 * Math.min(Math.abs(speed) * 0.09 + 0.35, 1);
  const steeringObj = vrDashboard.getObjectByName('steering');
  
  if (keys['ArrowLeft'] || keys['a']) {
    busAngle += turnFactor;
    if (steeringObj) steeringObj.rotation.z = Math.min(steeringObj.rotation.z + 0.1, 1.2);
  } else if (keys['ArrowRight'] || keys['d']) {
    busAngle -= turnFactor;
    if (steeringObj) steeringObj.rotation.z = Math.max(steeringObj.rotation.z - 0.1, -1.2);
  } else {
    // Kembalikan putaran kemudi ke tengah otomatis
    if (steeringObj) steeringObj.rotation.z *= 0.85;
  }

  // Update Posisi Bus Berdasarkan Sudut
  const speedInMS = speed / 3.6;
  busZ += Math.cos(busAngle) * speedInMS * dt;
  busX += Math.sin(busAngle) * speedInMS * dt;
  
  // Batas jalan raya agar tidak terperosok keluar aspal
  busX = Math.max(-3.5, Math.min(3.5, busX));

  busGroup.position.x = busX;
  busGroup.position.z = busZ;
  busGroup.rotation.y = busAngle;

  // Putar Roda-roda bus ketika bergerak
  const rollRot = (speedInMS / 0.52) * dt;
  for (let i = 0; i < 4; i++) {
    const wheel = busGroup.getObjectByName("wheel_" + i);
    if (wheel) wheel.rotation.x += rollRot;
  }

  // Kalkulasi total jarak tempuh
  if (Math.abs(speed) > 0.4) totalDist += Math.abs(speedInMS) * dt;

  // Posisi & Sudut Kamera Sesuai Pilihan Mode
  const fwdVec = new THREE.Vector3(Math.sin(busAngle), 0, Math.cos(busAngle));
  const sideVec = new THREE.Vector3(Math.cos(busAngle), 0, -Math.sin(busAngle));
  const currentBusPos = busGroup.position;

  // Jika WebXR sedang menyajikan VR, rendering ditangani internal. Kita pastikan posisi kamera berada di bangku supir.
  if (renderer.xr.isPresenting) {
    const driverSeatPos = currentBusPos.clone().addScaledVector(fwdVec, 3.25).add(new THREE.Vector3(0, 1.45, 0.1));
    renderer.xr.getCamera(camera).position.copy(driverSeatPos);
  } else {
    // Mode Desktop Biasa
    if (camMode === 0) {
      // First-Person (Kamera Pengemudi)
      const seatPos = currentBusPos.clone().addScaledVector(fwdVec, 3.25).add(new THREE.Vector3(0, 1.45, 0.1));
      camera.position.lerp(seatPos, 0.2);
      const lookAtTarget = currentBusPos.clone().addScaledVector(fwdVec, 32).add(new THREE.Vector3(0, 1.2, 0));
      camera.lookAt(lookAtTarget);
    } else if (camMode === 1) {
      // Kamera Belakang Luar
      const chasePos = currentBusPos.clone().addScaledVector(fwdVec, -12).add(new THREE.Vector3(0, 4.2, 0));
      camera.position.lerp(chasePos, 0.15);
      camera.lookAt(currentBusPos.clone().add(new THREE.Vector3(0, 1.3, 0)));
    } else if (camMode === 2) {
      // Kamera Samping Estetik
      const sidePos = currentBusPos.clone().addScaledVector(sideVec, 12).add(new THREE.Vector3(0, 2.5, 0));
      camera.position.lerp(sidePos, 0.15);
      camera.lookAt(currentBusPos.clone().add(new THREE.Vector3(0, 1.3, 0)));
    } else {
      // Kamera Atas (Bird-Eye View)
      const skyPos = currentBusPos.clone().add(new THREE.Vector3(0, 20, 0));
      camera.position.lerp(skyPos, 0.1);
      camera.lookAt(currentBusPos.clone());
    }
  }

  // Analisis Halte Terdekat di HUD
  let nextStop = '-', nearestDist = 9999;
  stops.forEach((sz, i) => {
    const d = sz - busZ;
    if (d > 0 && d < nearestDist) {
      nearestDist = d;
      nextStop = stopNames[i] + ' (' + Math.round(d) + ' m)';
    }
  });

  // Perbarui UI Teks HUD
  document.getElementById('h-speed').textContent = 'SPD: ' + Math.round(Math.abs(speed)) + ' km/h';
  document.getElementById('h-stop').textContent = 'HALTE BERIKUT: ' + nextStop;
  document.getElementById('h-dist').textContent = 'JARAK: ' + Math.round(totalDist) + ' m';

  // Proses interaksi pandangan tatap (VR Gaze)
  processGaze(dt);

  // Gambar Jarum Speedometer
  drawSpeedometer(speed);

  // Render Frame Utama
  renderer.render(scene, camera);
}

// Gunakan setAnimationLoop bawaan WebXR agar berjalan lancar di VR Headset
renderer.setAnimationLoop(gameLoop);

// Tampilkan Petunjuk Pertama
showMsg('Selamat Datang di Trans Musi VR Palembang! Nyalakan mesin (E) untuk memulai.');
