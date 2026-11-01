// AP-04: deterministic AABB navigation, dimensions in meters.
export const PLAYER_RADIUS = 0.24;
export const DOOR_INTERACT_RADIUS = 1.65;
export function insideRoom(x,z,room,radius=PLAYER_RADIUS){
 const b=room.bounds;
 return x>=b.minX+radius&&x<=b.maxX-radius&&z>=b.minZ+radius&&z<=b.maxZ-radius;
}
function furnitureCollision(x,z,items,radius){
 return items.some(f=>x>=f.center[0]-f.size[0]/2-radius&&x<=f.center[0]+f.size[0]/2+radius&&
   z>=f.center[2]-f.size[2]/2-radius&&z<=f.center[2]+f.size[2]/2+radius);
}
export function isWalkableAP04(x,z,layout,doors,radius=PLAYER_RADIUS){
 if(!Number.isFinite(x)||!Number.isFinite(z)||!Number.isFinite(radius)||radius<=0||radius>=.6)return false;
 const inRoom=layout.rooms.some(r=>insideRoom(x,z,r,radius));
 const inPortal=layout.doors.some(d=>{
  if(!doors[d.id])return false;
  const across=d.axis==='x'?x-d.x:z-d.z;
  const sideways=d.axis==='x'?z-d.z:x-d.x;
  return Math.abs(across)<=d.depth&&Math.abs(sideways)<=d.width/2-radius;
 });
 return (inRoom||inPortal)&&!furnitureCollision(x,z,layout.furniture,radius);
}
export function moveAP04(position,dx,dz,layout,doors,radius=PLAYER_RADIUS){
 let x=position.x,z=position.z;
 const n=Math.max(1,Math.ceil(Math.hypot(dx,dz)/.065));
 for(let i=0;i<n;i++){
  if(isWalkableAP04(x+dx/n,z,layout,doors,radius))x+=dx/n;
  if(isWalkableAP04(x,z+dz/n,layout,doors,radius))z+=dz/n;
 }
 return {x,z};
}
export function nearestDoorAP04(position,layout,maxDistance=DOOR_INTERACT_RADIUS){
 let selected=null,shortest=maxDistance;
 for(const d of layout.doors){
  const distance=Math.hypot(position.x-d.x,position.z-d.z);
  if(distance<=shortest){selected=d;shortest=distance;}
 }
 return selected;
}
export function roomAtAP04(position,layout){
 return layout.rooms.find(r=>insideRoom(position.x,position.z,r,0))?.label||"Umbral";
}
