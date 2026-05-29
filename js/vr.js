// ─── vr.js ────────────────────────────────────────────────────────
// Manajemen WebXR (Enter/Exit VR) dan Gaze Interaction

// ─── LOGIKA GAZE INTERACTION ──────────────────────────────────────
const raycaster = new THREE.Raycaster();
const screenCenter = new THREE.Vector2(0, 0);
let currentGazedBtn = null;
let gazeTimer = 0;
const GAZE_LIMIT = 1.5; // Butuh 1.5 detik memandang untuk aktivasi

function processGaze(dt) {
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
    hitObj.scale.set(1.2, 1.2, 1.2);

    if (currentGazedBtn !== hitObj) {
      currentGazedBtn = hitObj;
      gazeTimer = 0;
    } else {
      gazeTimer += dt;

      const progress = Math.min(gazeTimer / GAZE_LIMIT, 1);
      reticle.scale.setScalar(1.0 - progress * 0.6);

      if (gazeTimer >= GAZE_LIMIT) {
        triggerAction(hitObj.userData.action);
        gazeTimer = 0;
        reticle.scale.setScalar(1);
      }
    }
  } else {
    vrInteractiveButtons.forEach(btn => btn.scale.set(1, 1, 1));
    currentGazedBtn = null;
    gazeTimer = 0;
    reticle.scale.setScalar(1);
  }
}

function triggerAction(action) {
  if (action === 'engine')   toggleEngine();
  else if (action === 'gearUp')   shiftGear(1);
  else if (action === 'gearDown') shiftGear(-1);
  else if (action === 'horn')     honk();
  else if (action === 'door')     openDoor();
}

// ─── MANAJEMEN WEBXR (ENTER / EXIT VR) ───────────────────────────
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
  camMode = 0;
  showMsg('Masuk ke VR Mode! Tatap tombol dasbor 3D untuk kendali penuh.');
}

function onSessionEnded() {
  xrSession.removeEventListener('end', onSessionEnded);
  xrSession = null;
  vrBtn.textContent = '[ MASUK VR ]';
  vrBtn.classList.remove('active');
  showMsg('Keluar dari VR Mode.');
}
