import * as THREE from 'three';
import layout from './layout.json';
import {buildAP04,releaseImportedAP04} from './geometry.js';
import {moveAP04,nearestDoorAP04,roomAtAP04} from './navigation.js';
import {loadAP04GLB} from './loadGLB.js';

const view=document.querySelector('#view');
const zone=document.querySelector('#zone'),nearest=document.querySelector('#nearest');
const doorsLabel=document.querySelector('#doors'),message=document.querySelector('#msg');
const input=document.querySelector('#glb'),restore=document.querySelector('#restore');
const scene=new THREE.Scene();
scene.background=new THREE.Color('#273b4e');
scene.fog=new THREE.Fog('#273b4e',18,45);
const camera=new THREE.PerspectiveCamera(60,1,.1,100);
const renderer=new THREE.WebGLRenderer({antialias:true});
renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
renderer.shadowMap.enabled=true;
renderer.shadowMap.type=THREE.PCFSoftShadowMap;
view.appendChild(renderer.domElement);
scene.add(new THREE.HemisphereLight('#f9fbff','#776e64',2));
const sun=new THREE.DirectionalLight('#fff1db',2.6);
sun.position.set(-6,13,8);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);
sun.shadow.camera.left=-19;sun.shadow.camera.right=19;
sun.shadow.camera.top=19;sun.shadow.camera.bottom=-19;scene.add(sun);
const environment=buildAP04(scene,layout);
const player={...layout.spawn};
const openDoors=Object.fromEntries(layout.doors.map(d=>[d.id,false]));
let imported=null;
const keys=new Set();
window.addEventListener('keydown',(event)=>{
 const key=event.key.toLowerCase();
 if(['arrowup','arrowdown','arrowleft','arrowright'].includes(key))event.preventDefault();
 if(['input','textarea'].includes(event.target?.tagName?.toLowerCase()||''))return;
 if(!event.repeat&&key==='e'){
  const door=nearestDoorAP04(player,layout);
  if(door)openDoors[door.id]=!openDoors[door.id];
 }
 keys.add(key);
});
window.addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));
window.addEventListener('blur',()=>keys.clear());
function resize(){
 const w=Math.max(1,view.clientWidth),h=Math.max(1,view.clientHeight);
 camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h);
}
window.addEventListener('resize',resize);resize();
function restoreStatic(){
 if(imported){scene.remove(imported);releaseImportedAP04(imported);imported=null;}
 environment.staticGroup.visible=true;
 restore.disabled=true;message.textContent='Geometría 3D procedural de Three.js';
}
restore.addEventListener('click',restoreStatic);
input.addEventListener('change',async()=>{
 const file=input.files?.[0];if(!file)return;
 input.disabled=true;message.textContent='Validando GLB AP-04...';
 try{
  const candidate=await loadAP04GLB(file);
  if(imported){scene.remove(imported);releaseImportedAP04(imported);}
  imported=candidate;scene.add(imported);
  environment.staticGroup.visible=false;restore.disabled=false;
  message.textContent='GLB AP-04 importado localmente, navegación compartida';
 }catch(error){message.textContent='GLB rechazado: '+String(error?.message||error);}
 finally{input.disabled=false;input.value='';}
});
const clock=new THREE.Clock();
function tick(){
 requestAnimationFrame(tick);
 const dt=Math.min(clock.getDelta(),.05);
 const vx=Number(keys.has('d')||keys.has('arrowright'))-Number(keys.has('a')||keys.has('arrowleft'));
 const vz=Number(keys.has('s')||keys.has('arrowdown'))-Number(keys.has('w')||keys.has('arrowup'));
 const length=Math.hypot(vx,vz)||1;
 const next=moveAP04(player,vx/length*2.45*dt,vz/length*2.45*dt,layout,openDoors);
 player.x=next.x;player.z=next.z;
 environment.avatar.position.set(player.x,0,player.z);
 if(vx||vz)environment.avatar.rotation.y=Math.atan2(vx,-vz);
 for(const door of layout.doors){
  const pivot=environment.doorGroups.get(door.id);
  pivot.rotation.y=THREE.MathUtils.damp(pivot.rotation.y,openDoors[door.id]?door.openAngle:0,10,dt);
 }
 const near=nearestDoorAP04(player,layout);
 zone.textContent='Zona: '+roomAtAP04(player,layout);
 nearest.textContent=near?('Puerta cercana: '+near.label+' · pulsa E'):'Puerta cercana: ninguna';
 doorsLabel.textContent=layout.doors.map(d=>d.label+': '+(openDoors[d.id]?'abierta':'cerrada')).join(' · ');
 const desired=new THREE.Vector3(player.x+3,8.6,player.z+8);
 camera.position.lerp(desired,1-Math.exp(-4*dt));
 camera.lookAt(player.x,.8,player.z-1);
 renderer.render(scene,camera);
}
camera.position.set(player.x+3,8.6,player.z+8);
tick();
