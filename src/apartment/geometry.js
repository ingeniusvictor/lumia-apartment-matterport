import * as THREE from 'three';

function box(parent, name, size, position, color, options = {}) {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(...size),
    new THREE.MeshStandardMaterial({ color, roughness: 0.85, metalness: 0 })
  );
  mesh.name = name;
  mesh.position.set(...position);
  mesh.castShadow = options.castShadow !== false;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}
export function createApartment(scene) {
  const root = new THREE.Group();
  root.name = 'AP02_Greybox_Independent';
  scene.add(root);

  const wall = '#b5c3ce';
  box(root, 'floor_room', [8, 0.16, 6], [0, -0.08, 0], '#b9ab94');
  box(root, 'floor_corridor', [1.6, 0.16, 2], [0, -0.08, -4], '#ab9a88');
  box(root, 'wall_left', [0.14, 2.7, 6], [-4, 1.35, 0], wall);
  box(root, 'wall_right', [0.14, 2.7, 6], [4, 1.35, 0], wall);
  // North wall: central doorway opening 1.6 m wide and 2.3 m high.
  box(root, 'wall_back_left', [3.2, 2.7, 0.14], [-2.4, 1.35, -3], wall);
  box(root, 'wall_back_right', [3.2, 2.7, 0.14], [2.4, 1.35, -3], wall);
  box(root, 'door_lintel', [1.6, 0.4, 0.14], [0, 2.5, -3], wall);
  box(root, 'hall_wall_left', [0.14, 2.7, 2], [-0.8, 1.35, -4], wall);
  box(root, 'hall_wall_right', [0.14, 2.7, 2], [0.8, 1.35, -4], wall);
  box(root, 'hall_wall_back', [1.6, 2.7, 0.14], [0, 1.35, -5], wall);

  // Simplified laboratory furniture, with matching collision bounds.
  box(root, 'sofa_base', [1.9, 0.55, 1.35], [-2.3, 0.36, 1.42], '#4c7784');
  box(root, 'sofa_back', [1.9, 0.78, 0.22], [-2.3, 0.78, 2], '#3f6672');
  box(root, 'table', [1.4, 0.12, 0.85], [1.55, 0.73, 0.27], '#7d6046');
  for (const x of [1, 2.1]) for (const z of [-0.05, 0.6]) {
    box(root, 'table_leg', [0.1, 0.7, 0.1], [x, 0.35, z], '#6e5842');
  }
  box(root, 'chair_seat', [0.8, 0.15, 0.85], [1.42, 0.53, -1.7], '#b79572');
  box(root, 'chair_back', [0.8, 0.85, 0.12], [1.42, 1.04, -2.07], '#b79572');

  const hinge = new THREE.Group();
  hinge.name = 'door_hinge';
  hinge.position.set(-0.8, 0, -3);
  box(hinge, 'door_panel', [1.55, 2.25, 0.07], [0.775, 1.125, 0], '#c88e56');
  box(hinge, 'door_handle', [0.08, 0.08, 0.18], [1.36, 1.05, 0.13], '#f9d794');
  root.add(hinge);

  // Only a placeholder, not L.U.M.I.A. and not her approved VRM.
  const placeholder = new THREE.Group();
  placeholder.name = 'AP02_Test_Agent_NOT_LUMIA';
  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.25, 0.85, 6, 12), new THREE.MeshStandardMaterial({color:'#e9e3ca',roughness:0.6}));
  torso.position.y = 0.87;
  torso.castShadow = true;
  placeholder.add(torso);
  root.add(placeholder);
  return { root, hinge, placeholder };
}
