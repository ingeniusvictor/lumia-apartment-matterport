import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {validateAP04File,validateAP04GLB} from './loadGLB.js';
test('AP04 accepts only valid local GLB file',()=>{
 assert.doesNotThrow(()=>validateAP04File({name:'ap04.glb',size:3000}));
 assert.throws(()=>validateAP04File({name:'bad.zip',size:3000}),/\.glb/);
 assert.throws(()=>validateAP04File({name:'ap04.glb',size:0}),/vacío/);
});
test('AP04 import verifies static geometry contract',()=>{
 const scene=new THREE.Group();
 assert.throws(()=>validateAP04GLB(scene),/AP04_Apartment_Root/);
 for(const name of ['AP04_Apartment_Root','floor_hall','floor_salon','floor_dormitorio',
 'floor_estudio','wall_living_west','wall_bed_east','wall_studio_back']){
  const obj=new THREE.Object3D();obj.name=name;scene.add(obj);
 }
 const mesh=new THREE.Mesh(new THREE.BoxGeometry(12.1,2.7,14.1));
 mesh.position.set(0,1.35,-3);scene.add(mesh);
 assert.equal(validateAP04GLB(scene),scene);
 mesh.scale.set(.5,1,1);
 assert.throws(()=>validateAP04GLB(scene),/Escala/);
});
