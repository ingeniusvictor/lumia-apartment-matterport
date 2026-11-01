# AP-03 — Blender ↔ Three.js (laboratorio local)

Esta fase NO usa modelos, capturas ni activos extraídos de Matterport. Se genera una habitación ficticia editable que comparte medidas y disposición con la maqueta AP-02.

## Requisitos
- Blender instalado localmente (con exportador glTF 2.0 integrado).
- Node.js y dependencias del proyecto (npm install).
- Rama: feat/ap03-blender-glb-bridge.

## 1. Generar escena editable y GLB
En la carpeta raíz del repositorio, en PowerShell:
```powershell
blender --background --factory-startup --python tools/blender/ap03_create_room.py
```
Si `blender` no está en PATH, usa la ruta completa a blender.exe, por ejemplo:
```powershell
& "C:\Program Files\Blender Foundation\Blender 5.2\blender.exe" --background --factory-startup --python tools/blender/ap03_create_room.py
```
La ruta anterior es solo un ejemplo; usa tu ruta real.

El script guardará los resultados bajo `local-export/` (ignorada por Git):
- `ap03-apartment.blend` — archivo editable de Blender;
- `ap03-apartment.glb` — geometría estática para Three.js;
- `ap03-manifest.json` — evidencia de origen, unidades y contrato de colisión.

Puedes establecer un directorio diferente añadiendo `-- C:\ruta\de\salida`.

## 2. Ver y comparar
En PowerShell, desde la raíz del repositorio:
```powershell
npm install
npm test
npm run dev
```
Abre http://127.0.0.1:5173/ y prueba primero el escenario original AP-02. Selecciona `local-export/ap03-apartment.glb` mediante el selector **Importar escenario AP-03**. La aplicación valida estructura y dimensiones antes de mostrarlo.

Camina con WASD/flechas y abre la puerta con E. El avatar geométrico y la puerta siguen siendo los objetos dinámicos de AP-02; los únicos sustituidos son los muebles, paredes y suelo estáticos. Usa **Volver a habitación AP-02** para recuperar la maqueta original sin recargar.

## Restricciones de esta versión
- La navegación es aún AABB, fija: solo es compatible con el plano de laboratorio 8×6 m y pasillo de 1.6×2 m.
- Modificar paredes, muebles o unidades en Blender **exige actualizar las colisiones** antes de permitir navegación real. El cargador rechaza GLB de dimensiones/estructura inesperadas, pero no puede detectar todos los desplazamientos de obstáculos.
- No se carga VRM y no se modifica L.U.M.I.A. MOTION.
- No hay carga de .blend en navegador ni exportación directa a Matterport.
- Los archivos GLB y BLEND generados quedan locales y no deben incluirse en el repositorio público sin verificar su procedencia.

## Verificaciones
- CI: tests Node.js y build Vite.
- CI: análisis de sintaxis Python del generador (sin invocar Blender).
- Validación manual: salida Blender, importación real GLB en navegador, apertura/cierre de puerta, movimientos y botón de retorno.
- La ejecución del script Blender y su exportación GLB requieren pruebas en una instalación real de Blender; CI no certifica esta operación.
