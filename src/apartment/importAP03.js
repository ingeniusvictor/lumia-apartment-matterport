import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// Exact contract for the AP-03 Blender-generated laboratory model.
// Deliberately rejects arbitrary apartment meshes because navigation AABBs
// are fixed to the original test room, and would be unsafe for other layouts.
const REQUIRED = Object.freeze([
  'AP03_Apartment_Root', 'floor_room', 'floor_corridor',
  'wall_left', 'wall_right', 'wall_back_left', 'wall_back_right', 'door_lintel'
]);
export const MAX_AP03_FILE_BYTES = 80 * 1024 * 1024;

export function validateAP03File(file) {
  if (!file || typeof file.name !== 'string' || !/\.glb$/i.test(file.name)) {
    throw new Error('Selecciona un archivo .glb');
  }
  if (!Number.isFinite(file.size) || file.size <= 0 || file.size > MAX_AP03_FILE_BYTES) {
    throw new Error('El archivo debe tener entre 1 byte y 80 MiB');
  }
}
export function validateAP03Scene(root) {
  if (!root || typeof root.getObjectByName !== 'function') {
    throw new Error('El GLB no contiene una escena Three.js válida');
  }
  for (const name of REQUIRED) {
    if (!root.getObjectByName(name)) throw new Error('Falta el objeto Blender: ' + name);
  }
  const bounds = new THREE.Box3().setFromObject(root);
  const size = bounds.getSize(new THREE.Vector3());
  const center = bounds.getCenter(new THREE.Vector3());
  if (!(size.x >= 7.5 && size.x <= 8.8 &&
        size.y >= 2.5 && size.y <= 3.5 &&
        size.z >= 7.5 && size.z <= 8.8 &&
        Math.abs(center.x) <= 0.35 &&
        center.z >= -1.5 && center.z <= -0.4)) {
    throw new Error('Escala, ejes o límites incompatibles con la navegación AP-02');
  }
  return root;
}
export async function importAP03Scene(file) {
  validateAP03File(file);
  const url = URL.createObjectURL(file);
  try {
    const gltf = await new GLTFLoader().loadAsync(url);
    const root = gltf.scene;
    try {
      validateAP03Scene(root);
    } catch (error) {
      disposeImportedScene(root);
      throw error;
    }
    root.name = 'AP03_Imported_Static_Environment';
    root.traverse((object) => {
      if (object.isMesh) {
        object.castShadow = true;
        object.receiveShadow = true;
      }
    });
    return root;
  } finally {
    URL.revokeObjectURL(url);
  }
}
export function disposeImportedScene(root) {
  if (!root) return;
  const geometry = new Set(), materials = new Set(), textures = new Set();
  root.traverse((object) => {
    if (object.isMesh) {
      if (object.geometry) geometry.add(object.geometry);
      for (const material of Array.isArray(object.material) ? object.material : [object.material]) {
        if (!material) continue;
        materials.add(material);
        for (const value of Object.values(material)) if (value?.isTexture) textures.add(value);
      }
    }
  });
  geometry.forEach((v) => v.dispose());
  textures.forEach((v) => v.dispose());
  materials.forEach((v) => v.dispose());
}
