import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { validateAP03File, validateAP03Scene, MAX_AP03_FILE_BYTES } from './importAP03.js';

test('only local binary GLB with bounded size is accepted', () => {
  assert.doesNotThrow(() => validateAP03File({ name: 'ap03-room.glb', size: 2000 }));
  assert.throws(() => validateAP03File({ name: 'scene.gltf', size: 2000 }), /glb/);
  assert.throws(() => validateAP03File({ name: 'bad.glb', size: MAX_AP03_FILE_BYTES + 1 }), /80 MiB/);
  assert.throws(() => validateAP03File(null), /glb/);
});
test('scene must have named geometry and correct coordinate bounds', () => {
  const scene = new THREE.Group();
  assert.throws(() => validateAP03Scene(scene), /AP03_Apartment_Root/);
  const names = [
    'AP03_Apartment_Root','floor_room','floor_corridor','wall_left','wall_right',
    'wall_back_left','wall_back_right','door_lintel'
  ];
  for (const name of names) {
    const o = new THREE.Object3D();
    o.name = name;
    scene.add(o);
  }
  // Static laboratory bounds: X ±4, Z -5..3 and Y 0..2.7
  const sized = new THREE.Mesh(new THREE.BoxGeometry(8, 2.7, 8));
  sized.position.set(0, 1.35, -1);
  scene.add(sized);
  assert.equal(validateAP03Scene(scene), scene);
  sized.scale.set(0.1, 1, 1);
  assert.throws(() => validateAP03Scene(scene), /Escala/);
});
