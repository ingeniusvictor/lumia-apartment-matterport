import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {cameraDistanceForExtent,formatExtent,validateGLBFile,validateGLBHeader} from './validation.js';

const container=document.querySelector('#view');
const input=document.querySelector('#pilot');
const status=document.querySelector('#status');
const stats=document.querySelector('#stats');
const scene=new THREE.Scene();
scene.background=new THREE.Color('#293d52');
const camera=new THREE.PerspectiveCamera(52,1,.01,20000);
camera.position.set(5,4,9);
const renderer=new THREE.WebGLRenderer({antialias:true});
renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
container.appendChild(renderer.domElement);
scene.add(new THREE.HemisphereLight('#ffffff','#77777f',2.6));
const keyLight=new THREE.DirectionalLight('#fff2dd',2.5);
keyLight.position.set(8,16,12);scene.add(keyLight);
const controls=new OrbitControls(camera,renderer.domElement);
controls.enableDamping=true;
controls.target.set(0,1,0);
const axes=new THREE.AxesHelper(2);axes.visible=false;scene.add(axes);
let current=null;

function disposeScene(root){
 if(!root)return;
 const geometries=new Set(),materials=new Set(),textures=new Set();
 root.traverse(o=>{
  if(!o.isMesh)return;
  if(o.geometry)geometries.add(o.geometry);
  for(const mat of Array.isArray(o.material)?o.material:[o.material]){
   if(!mat)continue;materials.add(mat);
   for(const val of Object.values(mat))if(val?.isTexture)textures.add(val);
  }
 });
 geometries.forEach(v=>v.dispose());textures.forEach(v=>v.dispose());materials.forEach(v=>v.dispose());
}
async function importFile(file){
 validateGLBFile(file);
 const header=await file.slice(0,12).arrayBuffer();
 validateGLBHeader(header,file.size);
 const url=URL.createObjectURL(file);
 try{
  const gltf=await new GLTFLoader().loadAsync(url);
  const root=gltf.scene;
  const bounds=new THREE.Box3().setFromObject(root);
  if(bounds.isEmpty()){disposeScene(root);throw Error('No hay geometría visible en el GLB');}
  const size=bounds.getSize(new THREE.Vector3());
  const center=bounds.getCenter(new THREE.Vector3());
  const extent=Math.max(size.x,size.y,size.z);
  if(!Number.isFinite(extent)||extent<=0){disposeScene(root);throw Error('Límites del modelo inválidos');}
  if(current){scene.remove(current);disposeScene(current);}
  current=root;scene.add(root);
  const distance=cameraDistanceForExtent(extent,52)*1.5;
  camera.near=Math.max(.001,distance/1000);
  camera.far=Math.max(1000,distance*100);
  camera.updateProjectionMatrix();
  controls.target.copy(center);
  camera.position.set(center.x+distance*.66,center.y+distance*.52,center.z+distance);
  controls.minDistance=Math.max(.001,distance*.008);
  controls.maxDistance=distance*10;
  controls.update();
  axes.position.copy(center);axes.scale.setScalar(Math.max(1,extent*.1));
  axes.visible=true;
  let meshes=0,vertices=0;
  root.traverse(o=>{if(o.isMesh){meshes++;vertices+=o.geometry?.attributes?.position?.count||0;}});
  status.textContent='GLB local cargado. Revisión visual disponible; todavía sin navegación ni colisiones.';
  stats.textContent='Mallas: '+meshes+'\nVértices: '+vertices+
   '\nDimensión X: '+formatExtent(size.x)+
   '\nDimensión Y: '+formatExtent(size.y)+
   '\nDimensión Z: '+formatExtent(size.z);
 } finally{URL.revokeObjectURL(url);}
}
input.addEventListener('change',async()=>{
 const file=input.files?.[0];if(!file)return;
 input.disabled=true;
 status.textContent='Abriendo GLB local…';
 try{await importFile(file);}catch(err){status.textContent='Error de importación: '+String(err?.message||err);}
 finally{input.disabled=false;input.value='';}
});
function resize(){
 const w=Math.max(1,container.clientWidth),h=Math.max(1,container.clientHeight);
 camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h);
}
window.addEventListener('resize',resize);resize();
function frame(){requestAnimationFrame(frame);controls.update();renderer.render(scene,camera);}
frame();
