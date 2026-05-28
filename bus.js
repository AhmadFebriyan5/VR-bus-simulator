
const busGroup = new THREE.Group();

scene.add(busGroup);

function buildBus() {

  const body = new THREE.Mesh(
    new THREE.BoxGeometry(3, 2, 8),
    new THREE.MeshLambertMaterial({
      color: 0x0044cc
    })
  );

  body.position.y = 1;

  busGroup.add(body);

  const roof = new THREE.Mesh(
    new THREE.BoxGeometry(2.8, 0.3, 7.8),
    new THREE.MeshLambertMaterial({
      color: 0xffffff
    })
  );

  roof.position.y = 2.2;

  busGroup.add(roof);
}

buildBus();
