# AP-02 — Arquitectura de apartamento independiente

## Alcance
El objetivo es construir un motor 3D editable de laboratorio, separado de Matterport y de L.U.M.I.A. MOTION. La escena actual es FICTICIA, no una reconstrucción del apartamento de referencia.

## Capas
1. Fuente legal: planos/medidas propias o MatterPak autorizado; no se mezclan activos de terceros en el repositorio público.
2. Authoring: Blender para geometría, módulos de puertas, materiales y exportaciones GLB optimizadas.
3. Runtime: Three.js + Vite, origen en metros, +Y vertical; objetos y colisiones desacoplados.
4. Navegación: src/navigation/collision.js es el laboratorio determinista actual (AABB). Reemplazar posteriormente con navmesh, detección física y puertas con estados de tránsito.
5. Interacciones: AP-02 permite abrir/cerrar una puerta con E cerca del umbral; siguientes etapas: animaciones de bisagras coordinadas, sentarse, levantarse y muebles interactivos.
6. Adaptador LUMIA: no cargar ni editar su VRM hasta contar con la versión aprobada y una interfaz explícita.

## Criterios AP-02
- npm test: sin errores en AABB, límites, puerta y obstáculos.
- npm run build: bundle de Vite sin fallos.
- Abrir localhost, desplazarse con WASD/flechas, E junto a la puerta, atravesar el umbral solo cuando está abierta.
- Validación visual y de WebGL pendiente de navegador del usuario.
- Nunca dar por sentado que el entorno ficticio representa geometría de Matterport.

## Próximas fases
AP-03: introducción autorizada de plano/OBJ/GLB, medidas, origen y control de versiones de activos.
AP-04: navegación con navmesh y colisiones de mobiliario individual.
AP-05: conexión a VRM mediante adaptador, sin alterar MOTION.
AP-06: acciones contextuales, rutinas y Companion Life.

## Riesgos conocidos
El entorno es un greybox, no un juego final; los obstáculos usan límites aproximados y el control de teclado requiere PC. No hay VRM, guardado de posición, movilidad táctil, exportador Matterport ni mediciones del apartamento real.
