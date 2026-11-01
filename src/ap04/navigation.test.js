import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {isWalkableAP04,moveAP04,nearestDoorAP04,roomAtAP04} from './navigation.js';
const l=JSON.parse(readFileSync(new URL('./layout.json',import.meta.url),'utf8'));
const closed={salon:false,dormitorio:false,estudio:false};
const open={salon:true,dormitorio:true,estudio:true};
test('AP04 defines independent zones and doors',()=>{
 assert.equal(l.rooms.length,4);
 assert.equal(l.doors.length,3);
 assert.equal(isWalkableAP04(l.spawn.x,l.spawn.z,l,closed),true);
});
test('each doorway blocks passage when closed',()=>{
 for(const d of l.doors)assert.equal(isWalkableAP04(d.x,d.z,l,closed),false,d.id);
});
test('all three open doorways have a traversable seam',()=>{
 for(const d of l.doors)for(const across of [-.7,-.4,0,.4,.7]){
  const x=d.x+(d.axis==='x'?across:0),z=d.z+(d.axis==='z'?across:0);
  assert.equal(isWalkableAP04(x,z,l,open),true,d.id+' '+across);
 }
});
test('opening one door leaves others locked',()=>{
 assert.equal(isWalkableAP04(-1,1,l,{...closed,salon:true}),true);
 assert.equal(isWalkableAP04(1,1,l,{...closed,salon:true}),false);
});
test('outer bounds and furnishings block movement',()=>{
 for(const [x,z] of [[-6,0],[30,30],[-4.7,2.25],[4.25,2.2],[-1.7,-8.7]])
  assert.equal(isWalkableAP04(x,z,l,open),false,'obstacle '+x+','+z);
});
test('move cannot tunnel through lounge sofa',()=>{
 const end=moveAP04({x:-3,z:2.25},-5,0,l,open);
 assert.ok(end.x>-3.51&&end.x<-3.2,JSON.stringify(end));
 assert.equal(isWalkableAP04(end.x,end.z,l,open),true);
});
test('nearest door selection and room labels',()=>{
 assert.equal(nearestDoorAP04({x:-.3,z:1},l)?.id,'salon');
 assert.equal(roomAtAP04({x:4,z:0},l),'Dormitorio');
 assert.equal(nearestDoorAP04({x:0,z:-3.5},l),null);
});
