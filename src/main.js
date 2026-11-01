import * as THREE from 'three';
import { createApartment } from './apartment/geometry.js';
import { importAP03Scene, disposeImportedScene } from './apartment/importAP03.js';
import { moveWithCollision, canInteractWithDoor } from './navigation/collision.js';

const stage = document.getElementById('stage');
const doorLabel = document.getElementById('door');
const errorNode = document.getElementById('err');
const importInput = document.getElementById('glb-import');
const resetButton = document.getElementById('reset-scene');
const importStatus = document.getElementById('import-status');
try {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#25374d');
  scene.fog = new THREE.Fog('#25374d', 12, 25);

  const camera = new THREE.PerspectiveCamera(65, 1, 0.05, 80);
  camera.position.set(3.2, 4.2, 7.5);
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  stage.appendChild(renderer.domElement);

  scene.add(new THREE.HemisphereLight('#ecf3fc', '#6c6258', 2.1));
  const sun = new THREE.DirectionalLight('#fff3de', 2.8);
  sun.position.set(-3, 7, 6);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  sun.shadow.camera.left = -9;
  sun.shadow.camera.right = 9;
  sun.shadow.camera.top = 9;
  sun.shadow.camera.bottom = -9;
  scene.add(sun);

  const { root, hinge, placeholder } = createApartment(scene);
  let importedScene = null;
  const player = { x: 0, z: 1.1 };
  let doorOpen = false;
  const pressed = new Set();

  // AP-03 swaps only STATIC geometry. The working runtime door and test agent
  // remain under Three.js control and keep the same world coordinates.
  function restoreGreybox() {
    if (importedScene) {
      scene.remove(importedScene);
      disposeImportedScene(importedScene);
      importedScene = null;
    }
    if (hinge.parent !== root) root.add(hinge);
    if (placeholder.parent !== root) root.add(placeholder);
    root.visible = true;
    importStatus.textContent = 'Escenario: AP-02 original (laboratorio)';
    resetButton.disabled = true;
  }
  resetButton.addEventListener('click', restoreGreybox);
  importInput.addEventListener('change', async () => {
    const file = importInput.files?.[0];
    if (!file) return;
    importInput.disabled = true;
    resetButton.disabled = true;
    importStatus.textContent = 'Validando GLB local…';
    try {
      const candidate = await importAP03Scene(file);
      // No destructive changes until import and geometry contract are verified.
      if (importedScene) {
        scene.remove(importedScene);
        disposeImportedScene(importedScene);
      }
      root.remove(hinge);
      root.remove(placeholder);
      scene.add(hinge, placeholder);
      root.visible = false;
      importedScene = candidate;
      scene.add(importedScene);
      importStatus.textContent = 'Escenario: GLB de Blender (local, sin subida)';
    } catch (error) {
      importStatus.textContent = 'No se cargó el GLB: ' + String(error?.message ?? error);
      console.warn('AP-03 GLB rechazado:', error);
    } finally {
      importInput.disabled = false;
      resetButton.disabled = !importedScene;
      importInput.value = '';
    }
  });

  window.addEventListener('keydown', (event) => {
    const key = event.key.toLowerCase();
    if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(key)) event.preventDefault();
    if (!event.repeat && key === 'e' && canInteractWithDoor(player)) {
      doorOpen = !doorOpen;
      doorLabel.textContent = doorOpen ? 'Puerta: abierta' : 'Puerta: cerrada';
    }
    pressed.add(key);
  });
  window.addEventListener('keyup', (event) => pressed.delete(event.key.toLowerCase()));
  window.addEventListener('blur', () => pressed.clear());

  function resize() {
    const w = Math.max(1, stage.clientWidth), h = Math.max(1, stage.clientHeight);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }
  window.addEventListener('resize', resize);
  resize();

  const clock = new THREE.Clock();
  function frame() {
    requestAnimationFrame(frame);
    const dt = Math.min(clock.getDelta(), 0.05);
    const x = Number(pressed.has('d') || pressed.has('arrowright')) - Number(pressed.has('a') || pressed.has('arrowleft'));
    const z = Number(pressed.has('s') || pressed.has('arrowdown')) - Number(pressed.has('w') || pressed.has('arrowup'));
    const length = Math.hypot(x, z) || 1;
    const speed = 2.6;
    const next = moveWithCollision(player, x / length * speed * dt, z / length * speed * dt, { doorOpen });
    player.x = next.x;
    player.z = next.z;
    placeholder.position.set(player.x, 0, player.z);
    if (x || z) placeholder.rotation.y = Math.atan2(x, -z);

    const targetAngle = doorOpen ? -Math.PI * 0.54 : 0;
    hinge.rotation.y = THREE.MathUtils.damp(hinge.rotation.y, targetAngle, 9, dt);
    const camTarget = new THREE.Vector3(player.x + 2.5, 3.9, player.z + 5.8);
    camera.position.lerp(camTarget, 1 - Math.exp(-3 * dt));
    camera.lookAt(player.x, 0.9, player.z - 0.8);
    renderer.render(scene, camera);
  }
  frame();
} catch (error) {
  errorNode.style.display = 'block';
  errorNode.textContent = 'No se pudo iniciar WebGL: ' + String(error?.message ?? error);
  console.error(error);
}
