# L.U.M.I.A. COMPANION SPACE — Virtual Apartment

Repositorio independiente para investigar un futuro apartamento interactivo en Blender + Three.js. **NO es L.U.M.I.A. MOTION** y no modifica su avatar ni animaciones.

## Estado
- **AP-01**: copia inmutable verificada de 28 archivos del upstream matterport-dl en `vendor/matterport-dl`.
- **AP-02**: habitación ficticia con mesa, sofá, silla, puerta y navegación con colisión. Pruebas automatizadas y validación visual del usuario aprobadas.
- **AP-03**: generador Python para Blender (escena .blend editable y archivo .glb) e importación local mediante selector; conserva el escenario AP-02 como alternativa. **Validado en Blender 5.2.3 LTS y navegador**.
- **AP-04**: apartamento ficticio multihabitación (4 zonas, 3 puertas), Blender y GLB verificados en Windows.
- **AP-05**: visor GLB local e importador Blender para OBJ proporcionado con autorización por titular del modelo.
- **El recorrido Matterport no ofrece un OBJ públicamente descargable**; todavía no tenemos el MatterPak autorizado de este piloto. El archivador no fue ejecutado.

## Ejecutar
```bash
npm install
npm test
npm run dev
```
Abrir http://127.0.0.1:5173/. Movimiento con WASD/flechas y puerta con E.

## AP-05 · Ingreso de modelo autorizado
Consultar [docs/AP05_AUTHORIZED_PILOT.md](docs/AP05_AUTHORIZED_PILOT.md). El visor `/ap05.html` es independiente, no extrae archivos del enlace Matterport ni incluye colisiones para el modelo importado.

## Exportar un GLB ficticio desde Blender
Consultar [docs/AP03_BLENDER.md](docs/AP03_BLENDER.md). El modelo resultante es solo para pruebas: mantiene la geometría estándar; su aparición en la escena requiere cargar el GLB usando el selector local en el navegador.

## Desarrollo y protección de activos
- AP-01: `research/ap01-upstream-baseline` (baseline estable)
- AP-02: `feat/ap02-apartment-foundation` (PR #2)
- AP-03: `feat/ap03-blender-glb-bridge` (independiente, sobre AP-02)
- No tocar `vendor/matterport-dl`, `main`, L.U.M.I.A. MOTION ni sus VRM.
- Los datos y recursos de terceros requieren permisos. Ver [docs/ASSET_PERMISSIONS.md](docs/ASSET_PERMISSIONS.md).
