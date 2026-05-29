// ─── hud.js ───────────────────────────────────────────────────────
// HUD: Speedometer Canvas 2D, Pesan Layar

// ─── SPEEDOMETER CANVAS 2D ────────────────────────────────────────
const spCanvas = document.getElementById('speedometer');
spCanvas.width = 110; spCanvas.height = 110;
const spCtx = spCanvas.getContext('2d');

function drawSpeedometer(spd) {
  spCtx.clearRect(0, 0, 110, 110);

  // Lingkaran Latar
  spCtx.beginPath();
  spCtx.arc(55, 55, 48, 0, Math.PI * 2);
  spCtx.fillStyle = 'rgba(10,8,5,0.9)';
  spCtx.fill();
  spCtx.strokeStyle = '#e8d44d66';
  spCtx.lineWidth = 2;
  spCtx.stroke();

  // Garis Tanda
  for (let i = 0; i <= 10; i++) {
    const ang = (Math.PI * 0.75) + (i / 10) * (Math.PI * 1.5);
    spCtx.beginPath();
    spCtx.moveTo(55 + Math.cos(ang) * 36, 55 + Math.sin(ang) * 36);
    spCtx.lineTo(55 + Math.cos(ang) * 44, 55 + Math.sin(ang) * 44);
    spCtx.strokeStyle = '#e8d44d77';
    spCtx.lineWidth = i % 5 === 0 ? 2 : 1;
    spCtx.stroke();
  }

  // Jarum
  const pct = Math.min(Math.abs(spd) / 90, 1);
  const ang = (Math.PI * 0.75) + pct * (Math.PI * 1.5);
  spCtx.beginPath();
  spCtx.moveTo(55, 55);
  spCtx.lineTo(55 + Math.cos(ang) * 37, 55 + Math.sin(ang) * 37);
  spCtx.strokeStyle = spd > 70 ? '#ff3333' : '#e8d44d';
  spCtx.lineWidth = 3;
  spCtx.stroke();

  // Titik Tengah
  spCtx.beginPath();
  spCtx.arc(55, 55, 4, 0, Math.PI * 2);
  spCtx.fillStyle = '#e8d44d';
  spCtx.fill();

  // Angka Kecepatan
  spCtx.fillStyle = '#e8d44d';
  spCtx.font = 'bold 15px monospace';
  spCtx.textAlign = 'center';
  spCtx.fillText(Math.round(Math.abs(spd)), 55, 72);
  spCtx.font = '9px monospace';
  spCtx.fillStyle = '#e8d44d88';
  spCtx.fillText('km/h', 55, 83);
}

// ─── PESAN LAYAR ──────────────────────────────────────────────────
let msgTimer = null;
function showMsg(text) {
  const el = document.getElementById('msg');
  el.textContent = text;
  el.style.opacity = '1';
  clearTimeout(msgTimer);
  msgTimer = setTimeout(() => el.style.opacity = '0', 2500);
}
