// ─── main.js ──────────────────────────────────────────────────────
// Game Loop Utama: Fisika Bus, Kamera, Update HUD, Render

let lastFrameTime = performance.now();

function gameLoop(now) {
  const dt = Math.min((now - lastFrameTime) / 1000, 0.05);
  lastFrameTime = now;

  // ─── FISIKA PERGERAKAN BUS ───────────────────────────────────────
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
        speed = Math.max(speed - 15 * dt, 0);
      }
    } else {
      speed *= (1 - 0.9 * dt);
      if (Math.abs(speed) < 0.1) speed = 0;
    }
  } else {
    speed *= (1 - 1.8 * dt);
    if (Math.abs(speed) < 0.05) speed = 0;
  }

  // ─── KENDALI KEMUDI ──────────────────────────────────────────────
  const turnFactor = 0.016 * Math.min(Math.abs(speed) * 0.09 + 0.35, 1);
  const steeringObj = vrDashboard.getObjectByName('steering');

  if (keys['ArrowLeft'] || keys['a']) {
    busAngle += turnFactor;
    if (steeringObj) steeringObj.rotation.z = Math.min(steeringObj.rotation.z + 0.1, 1.2);
  } else if (keys['ArrowRight'] || keys['d']) {
    busAngle -= turnFactor;
    if (steeringObj) steeringObj.rotation.z = Math.max(steeringObj.rotation.z - 0.1, -1.2);
  } else {
    if (steeringObj) steeringObj.rotation.z *= 0.85;
  }

  // ─── UPDATE POSISI BUS ───────────────────────────────────────────
  const speedInMS = speed / 3.6;
  busZ += Math.cos(busAngle) * speedInMS * dt;
  busX += Math.sin(busAngle) * speedInMS * dt;
  busX = Math.max(-3.5, Math.min(3.5, busX));

  busGroup.position.x = busX;
  busGroup.position.z = busZ;
  busGroup.rotation.y = busAngle;

  // Putar Roda
  const rollRot = (speedInMS / 0.52) * dt;
  for (let i = 0; i < 4; i++) {
    const wheel = busGroup.getObjectByName("wheel_" + i);
    if (wheel) wheel.rotation.x += rollRot;
  }

  if (Math.abs(speed) > 0.4) totalDist += Math.abs(speedInMS) * dt;

  // ─── POSISI KAMERA ───────────────────────────────────────────────
  const fwdVec  = new THREE.Vector3(Math.sin(busAngle), 0, Math.cos(busAngle));
  const sideVec = new THREE.Vector3(Math.cos(busAngle), 0, -Math.sin(busAngle));
  const currentBusPos = busGroup.position;

  if (renderer.xr.isPresenting) {
    const driverSeatPos = currentBusPos.clone().addScaledVector(fwdVec, 3.25).add(new THREE.Vector3(0, 1.45, 0.1));
    renderer.xr.getCamera(camera).position.copy(driverSeatPos);
  } else {
    if (camMode === 0) {
      const seatPos = currentBusPos.clone().addScaledVector(fwdVec, 3.25).add(new THREE.Vector3(0, 1.45, 0.1));
      camera.position.lerp(seatPos, 0.2);
      camera.lookAt(currentBusPos.clone().addScaledVector(fwdVec, 32).add(new THREE.Vector3(0, 1.2, 0)));
    } else if (camMode === 1) {
      const chasePos = currentBusPos.clone().addScaledVector(fwdVec, -12).add(new THREE.Vector3(0, 4.2, 0));
      camera.position.lerp(chasePos, 0.15);
      camera.lookAt(currentBusPos.clone().add(new THREE.Vector3(0, 1.3, 0)));
    } else if (camMode === 2) {
      const sidePos = currentBusPos.clone().addScaledVector(sideVec, 12).add(new THREE.Vector3(0, 2.5, 0));
      camera.position.lerp(sidePos, 0.15);
      camera.lookAt(currentBusPos.clone().add(new THREE.Vector3(0, 1.3, 0)));
    } else {
      const skyPos = currentBusPos.clone().add(new THREE.Vector3(0, 20, 0));
      camera.position.lerp(skyPos, 0.1);
      camera.lookAt(currentBusPos.clone());
    }
  }

  // ─── UPDATE HUD ──────────────────────────────────────────────────
  let nextStop = '-', nearestDist = 9999;
  stops.forEach((sz, i) => {
    const d = sz - busZ;
    if (d > 0 && d < nearestDist) {
      nearestDist = d;
      nextStop = stopNames[i] + ' (' + Math.round(d) + ' m)';
    }
  });

  document.getElementById('h-speed').textContent = 'SPD: ' + Math.round(Math.abs(speed)) + ' km/h';
  document.getElementById('h-stop').textContent  = 'HALTE BERIKUT: ' + nextStop;
  document.getElementById('h-dist').textContent  = 'JARAK: ' + Math.round(totalDist) + ' m';

  // ─── PROSES GAZE VR & RENDER ────────────────────────────────────
  processGaze(dt);
  drawSpeedometer(speed);
  renderer.render(scene, camera);
}

renderer.setAnimationLoop(gameLoop);

showMsg('Selamat Datang di Trans Musi VR Palembang! Nyalakan mesin (E) untuk memulai.');
