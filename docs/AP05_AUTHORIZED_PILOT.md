# AP-05 · Piloto del condominio — entrada de geometría autorizada

Referencia visual (recorrido Matterport):
https://my.matterport.com/show/?m=hMG8ApCXTX7

**Importante:** el enlace público al recorrido no proporciona automáticamente un archivo OBJ ni autoriza su reproducción o extracción. Actualmente no tenemos evidencia de un MatterPak descargado ni de derechos de adaptación concedidos. El código de vendor no debe usarse para extraer assets de ese recorrido.

## Vía oficial
El administrador o editor autorizado puede consultar el add-on MatterPak del espacio en su cuenta de Matterport. MatterPak incluye OBJ/MTL/texturas JPG, plano de planta y nube XYZ. Dependiendo de cuenta y estado del modelo, puede requerir compra. La descarga debe provenir del titular/colaborador autorizado.

Documentación oficial:
https://support.matterport.com/s/article/Download-the-MatterPak-Bundle?language=en_US

## Preparado sin contenido del piloto
- tools/blender/ap05_import_authorized_obj.py: importa OBJ local con confirmación explícita de permiso, guarda archivo BLEND editable, GLB y manifiesto de escala/orientación no verificadas.
- ap05.html: visor GLB de inspección local, con cámara orbital; no descarga el recorrido Matterport.
- src/ap05/validation.js: contrato de cabecera, formato y tamaño GLB.
- Todos los artefactos locales permanecen excluidos de Git; no incluir fuentes privadas, direcciones ni texturas en el repositorio público.

## Instrucciones cuando obtengamos un OBJ realmente autorizado
1. Guardar OBJ, su MTL y texturas en una carpeta privada del equipo.
2. Confirmar derechos de reproducción y adaptación, incluso para un uso experimental.
3. Desde la raíz del repositorio, ejecutar con Blender 5.2.3 LTS en PowerShell (sustituir el nombre y ruta de ejemplo):

~~~powershell
& $blender --background --factory-startup --python tools/blender/ap05_import_authorized_obj.py -- --source "C:\RUTA_PRIVADA\MODELO_AUTORIZADO.obj" --confirm-rights
~~~

La bandera --confirm-rights representa una declaración del operador, no una verificación técnica o legal. El parámetro opcional --unit-scale permite corrección de escala; no se asume que el OBJ venga en metros.

4. Salida local en local-export/ap05:
   - ap05-authorized-pilot.blend
   - ap05-authorized-pilot.glb
   - ap05-import-manifest.json
5. Ejecutar npm run dev, visitar http://127.0.0.1:5173/ap05.html y elegir el GLB local.

El visor solo sirve para inspeccionar geometría, orientación, materiales y dimensiones no calibradas. No permite recorrer el modelo como si fuese AP-04: las colisiones, puertas y unidades se deberán validar a partir de medidas autorizadas.

## Si solo tenemos el enlace público
Pedir al administrador del espacio el MatterPak o recibir plano/medidas propias o autorizadas. No hacer extracción de geometría o texturas del visor público.

## Aislamiento
AP-04 mantiene su rama validada, feat/ap04-multiroom-lab. AP-05 se desarrolla en feat/ap05-authorized-pilot-import, sin tocar main, vendor/matterport-dl, L.U.M.I.A. MOTION ni el VRM.
