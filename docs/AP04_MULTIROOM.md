# AP-04 · Apartamento multihabitación de laboratorio

## Objetivo
Un escenario **ficticio**, original y editable: pasillo central, sala, dormitorio y estudio, con tres puertas independientes. No es una representación del apartamento Matterport real y no utiliza sus assets.

## Arquitectura
- src/ap04/layout.json: fuente compartida para habitaciones, puertas, paredes y muebles.
- src/ap04/navigation.js: colisiones AABB derivadas del layout. Las puertas bloquean el umbral hasta abrirse.
- src/ap04/geometry.js: visualización Three.js con puertas animadas y personaje cápsula (no L.U.M.I.A.).
- tools/blender/ap04_create_multiroom.py: crea BLEND/GLB originales usando el mismo layout JSON.
- src/ap04/loadGLB.js: carga GLB local bajo un contrato de nombres y escala.

AP-02/AP-03 permanecen en index.html; AP-04 tiene página independiente ap04.html.

## Prueba con Three.js
1. Cambiar a feat/ap04-multiroom-lab.
2. npm install
3. npm test
4. npm run build
5. npm run dev
6. Abrir http://127.0.0.1:5173/ap04.html
7. Caminar con WASD y acercarse a cada puerta: Sala, Dormitorio y Estudio. Pulsar E para abrir y cerrar cada una y cruzar únicamente la abierta.

## Modelo editable Blender
En la raíz del repositorio, ejecutar:
blender --background --factory-startup --python tools/blender/ap04_create_multiroom.py

Con Blender instalado fuera de PATH, usar el ejecutable Blender 5.2.3 de Windows que ya funcionó en AP-03. El script crea en local-export/ap04:
- ap04-multiroom.blend
- ap04-multiroom.glb
- ap04-manifest.json

En el visor AP-04, escoger "Importar escenario Blender AP-04" y seleccionar el GLB. Probar las tres puertas, el movimiento y "Volver a geometría AP-04 original".

## Restricciones
- No descargar Matterport ni incorporar sus imágenes o geometría sin permisos.
- No tocar vendor/matterport-dl, main ni L.U.M.I.A. MOTION.
- La geometría de prueba no es un plano real.
- La navegación AABB es un prototipo, no una navmesh. Modificar el layout requiere actualizar colisiones y repetir validaciones.
- No se importa el VRM aprobado todavía.
- Los archivos generados son privados y quedan ignorados por Git.
