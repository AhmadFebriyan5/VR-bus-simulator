
function createRoad() {

  const road = new THREE.Mesh(
    new THREE.PlaneGeometry(8, 400),
    new THREE.MeshLambertMaterial({
      color: 0x333333
    })
  );

  road.rotation.x = -Math.PI / 2;

  scene.add(road);
}

function createBridge() {

  const bridge = new THREE.Mesh(
    new THREE.BoxGeometry(12, 8, 2),
    new THREE.MeshLambertMaterial({
      color: 0xcc1111
    })
  );

  bridge.position.set(0, 4, 0);

  scene.add(bridge);
}

createRoad();
createBridge();
