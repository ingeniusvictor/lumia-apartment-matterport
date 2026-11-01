export const MAX_GLTF_FILE_BYTES = 512 * 1024 * 1024;
export const GLB_MAGIC = 0x46546c67;

export function validateGLBFile(file) {
  if (!file || !/\.glb$/i.test(file.name ?? '')) {
    throw new Error('Selecciona un archivo .glb autorizado');
  }
  if (!Number.isFinite(file.size) || file.size < 20 || file.size > MAX_GLTF_FILE_BYTES) {
    throw new Error('El GLB debe tener entre 20 bytes y 512 MiB');
  }
}
export function validateGLBHeader(buffer, expectedBytes) {
  if (!(buffer instanceof ArrayBuffer) || buffer.byteLength < 12) {
    throw new Error('Cabecera GLB incompleta');
  }
  const header = new DataView(buffer);
  if (header.getUint32(0, true) !== GLB_MAGIC || header.getUint32(4, true) !== 2) {
    throw new Error('El archivo no es GLB versión 2');
  }
  const claimedSize = header.getUint32(8, true);
  if (claimedSize !== expectedBytes) throw new Error('La longitud indicada por el GLB no coincide con el archivo');
  return true;
}
export function cameraDistanceForExtent(maxExtent, verticalFovDegrees=52) {
  if (!Number.isFinite(maxExtent) || maxExtent <= 0) throw new Error('Dimensión 3D inválida');
  return Math.max(2, (maxExtent * .65) / Math.tan(verticalFovDegrees * Math.PI / 360));
}
export function formatExtent(v) {
  return Number.isFinite(v) && v >= 0 ? v.toFixed(2) + ' unidades sin calibrar' : 'desconocido';
}
