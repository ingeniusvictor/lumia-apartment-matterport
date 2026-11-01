# L.U.M.I.A. COMPANION SPACE — Virtual Apartment

Repositorio independiente para investigar un futuro apartamento interactivo en Blender + Three.js. NO es L.U.M.I.A. MOTION y no modifica su avatar ni sus animaciones.

## Estado
- AP-01: copia inmutable verificada de 28 archivos del upstream matterport-dl, dentro de vendor/matterport-dl.
- AP-02: prototipo de una habitación ficticia, mesa, sofá, silla, puerta animada y navegación con colisión.
- No hay datos ni modelo exportado del recorrido Matterport real.

## Ejecutar la maqueta de laboratorio
Requiere Node.js y npm.
1. npm install
2. npm test
3. npm run dev
4. Abrir la URL local indicada por Vite (habitualmente http://127.0.0.1:5173/).
5. Usar WASD/flechas para caminar y E cerca de la puerta para alternar su estado.

Para compilar: npm run build.

## Aislamiento
Los modelos del apartamento, capturas del recorrido, credenciales, exportaciones GLB y materiales con licencia restringida no pertenecen al repositorio público. Ver docs/ASSET_PERMISSIONS.md.

## Desarrollo
Rama baseline: research/ap01-upstream-baseline.
Rama de prototipo: feat/ap02-apartment-foundation.
No editar vendor/matterport-dl ni main. Ver docs/BASELINE_AP01.md y docs/AP02_ARCHITECTURE.md.

## Limitaciones
No hay todavía colisiones físicas completas, navmesh, rig VRM ni tareas de Matterport autorizadas. La escena actual se diseñó de cero para pruebas de navegación y visualización.
