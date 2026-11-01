// AP-02: navegación AABB determinista, sin dependencias gráficas.
// Coordenadas en metros. Ejes: +Y vertical; X horizontal; Z profundidad.
export const ROOM = Object.freeze({ minX: -4, maxX: 4, minZ: -3, maxZ: 3 });
export const HALLWAY = Object.freeze({ minX: -0.8, maxX: 0.8, minZ: -5, maxZ: -3 });
export const DOOR = Object.freeze({ x: 0, z: -3, interactionRadius: 1.8 });
export const FURNITURE = Object.freeze([
  Object.freeze({ minX: -3.25, maxX: -1.35, minZ: 0.7, maxZ: 2.15, name: 'sofa' }),
  Object.freeze({ minX: 0.85, maxX: 2.25, minZ: -0.15, maxZ: 0.7, name: 'mesa' }),
  Object.freeze({ minX: 1.0, maxX: 1.85, minZ: -2.2, maxZ: -1.15, name: 'silla' })
]);

function insideRect(x, z, box, radius) {
  return x >= box.minX + radius && x <= box.maxX - radius &&
    z >= box.minZ + radius && z <= box.maxZ - radius;
}
function intersectsExpandedRect(x, z, box, radius) {
  return x >= box.minX - radius && x <= box.maxX + radius &&
    z >= box.minZ - radius && z <= box.maxZ + radius;
}
export function canInteractWithDoor(position) {
  return Math.hypot(position.x - DOOR.x, position.z - DOOR.z) <= DOOR.interactionRadius;
}
export function isWalkable(x, z, options = {}) {
  const radius = options.radius ?? 0.24;
  if (!Number.isFinite(x) || !Number.isFinite(z) || !Number.isFinite(radius) || radius < 0 || radius >= 0.8) return false;
  const inRoom = insideRect(x, z, ROOM, radius);
  // An open door forms a continuous traversable strip across the shared room/hallway seam.
  const passage = { minX: HALLWAY.minX, maxX: HALLWAY.maxX, minZ: HALLWAY.minZ, maxZ: ROOM.maxZ };
  const inPassage = options.doorOpen === true && insideRect(x, z, passage, radius);
  if (!inRoom && !inPassage) return false;
  return !FURNITURE.some((item) => intersectsExpandedRect(x, z, item, radius));
}
export function moveWithCollision(position, dx, dz, options = {}) {
  let x = position.x;
  let z = position.z;
  // Small fixed substeps prevent tunneling through narrow obstacles on slow frames.
  const steps = Math.max(1, Math.ceil(Math.hypot(dx, dz) / 0.08));
  for (let i = 0; i < steps; i += 1) {
    const sx = dx / steps;
    const sz = dz / steps;
    if (isWalkable(x + sx, z, options)) x += sx;
    if (isWalkable(x, z + sz, options)) z += sz;
  }
  return { x, z };
}
