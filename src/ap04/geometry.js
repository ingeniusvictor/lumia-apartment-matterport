import * as THREE from 'three';
function cube(parent,size,center,color,name){
 const mesh=new THREE.Mesh(new THREE.BoxGeometry(...size),new THREE.MeshStandardMaterial({color,roughness:.84}));
 mesh.name=name;mesh.position.set(...center);
 mesh.castShadow=!name.startsWith('floor_');mesh.receiveShadow=true;
 parent.add(mesh);return mesh;
}
export function buildAP04(scene,layout){
 const staticGroup=new THREE.Group();staticGroup.name='AP04_Procedural_Static';scene.add(staticGroup);
 for(const room of layout.rooms){
  const b=room.bounds;
  cube(staticGroup,[b.maxX-b.minX,.16,b.maxZ-b.minZ],
   [(b.minX+b.maxX)/2,-.08,(b.minZ+b.maxZ)/2],room.floorColor,'floor_'+room.id);
 }
 for(const part of [...layout.walls,...layout.furniture])cube(staticGroup,part.size,part.center,part.color,part.id);
 const dynamic=new THREE.Group();dynamic.name='AP04_Dynamic';scene.add(dynamic);
 const doorGroups=new Map();
 for(const door of layout.doors){
  const pivot=new THREE.Group();pivot.name='AP04_Door_'+door.id;dynamic.add(pivot);
  if(door.axis==='x'){
   pivot.position.set(door.x,0,door.z-door.width/2);
   cube(pivot,[.065,2.25,door.width],[0,1.125,door.width/2],'#bd8452',door.id+'_panel');
   cube(pivot,[.16,.08,.08],[.1,1.1,door.width-.16],'#e8c889',door.id+'_handle');
  }else{
   pivot.position.set(door.x-door.width/2,0,door.z);
   cube(pivot,[door.width,2.25,.065],[door.width/2,1.125,0],'#bd8452',door.id+'_panel');
   cube(pivot,[.08,.08,.16],[door.width-.16,1.1,.1],'#e8c889',door.id+'_handle');
  }
  doorGroups.set(door.id,pivot);
 }
 const avatar=new THREE.Group();avatar.name='AP04_Test_Agent_NOT_LUMIA';
 const capsule=new THREE.Mesh(new THREE.CapsuleGeometry(.24,.85,6,12),
    new THREE.MeshStandardMaterial({color:'#ecdec1',roughness:.7}));
 capsule.position.y=.87;capsule.castShadow=true;avatar.add(capsule);dynamic.add(avatar);
 return {staticGroup,dynamic,doorGroups,avatar};
}
export function releaseImportedAP04(root){
 if(!root)return;
 const geometries=new Set(),materials=new Set(),textures=new Set();
 root.traverse(obj=>{
  if(!obj.isMesh)return;
  if(obj.geometry)geometries.add(obj.geometry);
  for(const mat of Array.isArray(obj.material)?obj.material:[obj.material]){
   if(!mat)continue;materials.add(mat);
   for(const value of Object.values(mat))if(value?.isTexture)textures.add(value);
  }
 });
 geometries.forEach(v=>v.dispose());
 textures.forEach(v=>v.dispose());
 materials.forEach(v=>v.dispose());
}
