import test from 'node:test';
import assert from 'node:assert/strict';
import {validateGLBFile,validateGLBHeader,cameraDistanceForExtent,formatExtent,GLB_MAGIC} from './validation.js';
test('AP05 requires a bounded .glb',()=>{
 assert.doesNotThrow(()=>validateGLBFile({name:'piloto.glb',size:1000}));
 assert.throws(()=>validateGLBFile({name:'no.obj',size:1000}),/glb/);
 assert.throws(()=>validateGLBFile({name:'piloto.glb',size:1}),/20 bytes/);
 assert.throws(()=>validateGLBFile({name:'piloto.glb',size:513*1024*1024}),/512 MiB/);
});
test('AP05 checks GLB version and length against file size',()=>{
 const bytes=new ArrayBuffer(12);
 const view=new DataView(bytes);
 view.setUint32(0,GLB_MAGIC,true);view.setUint32(4,2,true);view.setUint32(8,512,true);
 assert.equal(validateGLBHeader(bytes,512),true);
 assert.throws(()=>validateGLBHeader(bytes,100),/longitud/);
 view.setUint32(4,1,true);
 assert.throws(()=>validateGLBHeader(bytes,512),/versión 2/);
});
test('AP05 camera fitting is finite and monotonic',()=>{
 const a=cameraDistanceForExtent(4);
 const b=cameraDistanceForExtent(9);
 assert.ok(a>=2 && b>a);
 assert.throws(()=>cameraDistanceForExtent(-1),/inválida/);
 assert.equal(formatExtent(3.456),'3.46 unidades sin calibrar');
});
