import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {releaseImportedAP04} from './geometry.js';
const NAMES=['AP04_Apartment_Root','floor_hall','floor_salon','floor_dormitorio',
 'floor_estudio','wall_living_west','wall_bed_east','wall_studio_back'];
export function validateAP04File(file){
 if(!file||!/\.glb$/i.test(file.name||''))throw Error('Selecciona un archivo .glb');
 if(!(file.size>0&&file.size<=100*1024*1024))throw Error('GLB vacío o mayor de 100 MiB');
}
export function validateAP04GLB(scene){
 if(!scene?.getObjectByName)throw Error('No se pudo leer una escena 3D');
 for(const name of NAMES)if(!scene.getObjectByName(name))throw Error('Objeto faltante: '+name);
 const size=new THREE.Box3().setFromObject(scene).getSize(new THREE.Vector3());
 if(size.x<11.8||size.x>12.5||size.z<13.8||size.z>14.5||size.y<2.5||size.y>3.2)
  throw Error('Escala o coordenadas incompatibles con AP-04');
 return scene;
}
export async function loadAP04GLB(file){
 validateAP04File(file);
 const url=URL.createObjectURL(file);
 try{
  const result=await new GLTFLoader().loadAsync(url);
  try{validateAP04GLB(result.scene);}catch(e){releaseImportedAP04(result.scene);throw e;}
  result.scene.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});
  return result.scene;
 }finally{URL.revokeObjectURL(url);}
}
