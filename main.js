
let speed = 0;

function updateMovement(dt) {

  if (keys['w']) {
    speed += 10 * dt;
  }

  if (keys['s']) {
    speed -= 10 * dt;
  }

  speed *= 0.98;

  busGroup.position.z += speed * dt;

  updateSpeed(speed);
}

let lastTime = performance.now();

function gameLoop(now) {

  const dt = (now - lastTime) / 1000;
  lastTime = now;

  updateMovement(dt);

  camera.lookAt(busGroup.position);

  renderer.render(scene, camera);
}

renderer.setAnimationLoop(gameLoop);
