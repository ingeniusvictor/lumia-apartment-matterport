# SPDX-License-Identifier: MIT
r"""AP-03: create a clean, Blender-editable laboratory apartment and export GLB.

This is an ORIGINAL procedural room. It contains no Matterport assets.
Requires Blender with the built-in glTF 2.0 exporter.
Usage: blender --background --factory-startup --python tools/blender/ap03_create_room.py
Optional output directory after --:
  blender --background --python tools/blender/ap03_create_room.py -- C:\temp\lumia-ap03
"""
from pathlib import Path
import json
import sys

import bpy

PROJECT_ROOT = Path(__file__).resolve().parents[2]
output = Path(sys.argv[sys.argv.index("--") + 1]).expanduser() if "--" in sys.argv and len(sys.argv) > sys.argv.index("--") + 1 else PROJECT_ROOT / "local-export"
output.mkdir(parents=True, exist_ok=True)

bpy.ops.object.select_all(action="SELECT")
bpy.ops.object.delete(use_global=False)
for material in list(bpy.data.materials):
    bpy.data.materials.remove(material)

root = bpy.data.objects.new("AP03_Apartment_Root", None)
bpy.context.scene.collection.objects.link(root)

def material(name, hexcode):
    rgb = [int(hexcode[i:i + 2], 16) / 255 for i in (1, 3, 5)]
    m = bpy.data.materials.new(name)
    m.diffuse_color = (*rgb, 1)
    bsdf = m.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = (*rgb, 1)
        bsdf.inputs["Roughness"].default_value = 0.85
    return m

palette = {code: material("Color_" + code[1:], code) for code in [
    "#b9ab94", "#ab9a88", "#b5c3ce", "#4c7784",
    "#3f6672", "#7d6046", "#6e5842", "#b79572"
]}

def box(name, dimensions, location, color):
    # Three (+X,+Y-up,+Z-depth) -> Blender (+X,-Y-depth,+Z-up)
    dx, dy, dz = dimensions
    x, y, z = location
    bpy.ops.mesh.primitive_cube_add(size=1, location=(x, -z, y))
    obj = bpy.context.object
    obj.name = name
    obj.dimensions = (dx, dz, dy)
    obj.data.materials.append(palette[color])
    obj.parent = root
    return obj

box("floor_room", (8, .16, 6), (0, -.08, 0), "#b9ab94")
box("floor_corridor", (1.6, .16, 2), (0, -.08, -4), "#ab9a88")
box("wall_left", (.14, 2.7, 6), (-4, 1.35, 0), "#b5c3ce")
box("wall_right", (.14, 2.7, 6), (4, 1.35, 0), "#b5c3ce")
box("wall_back_left", (3.2, 2.7, .14), (-2.4, 1.35, -3), "#b5c3ce")
box("wall_back_right", (3.2, 2.7, .14), (2.4, 1.35, -3), "#b5c3ce")
box("door_lintel", (1.6, .4, .14), (0, 2.5, -3), "#b5c3ce")
box("hall_wall_left", (.14, 2.7, 2), (-.8, 1.35, -4), "#b5c3ce")
box("hall_wall_right", (.14, 2.7, 2), (.8, 1.35, -4), "#b5c3ce")
box("hall_wall_back", (1.6, 2.7, .14), (0, 1.35, -5), "#b5c3ce")
box("sofa_base", (1.9, .55, 1.35), (-2.3, .36, 1.42), "#4c7784")
box("sofa_back", (1.9, .78, .22), (-2.3, .78, 2), "#3f6672")
box("table", (1.4, .12, .85), (1.55, .73, .27), "#7d6046")
for x in [1, 2.1]:
    for z in [-.05, .6]:
        box("table_leg", (.1, .7, .1), (x, .35, z), "#6e5842")
box("chair_seat", (.8, .15, .85), (1.42, .53, -1.7), "#b79572")
box("chair_back", (.8, .85, .12), (1.42, 1.04, -2.07), "#b79572")

# Door and temporary agent stay in the Three.js runtime, not in this static GLB.
bpy.context.scene.unit_settings.system = "METRIC"
bpy.context.scene.unit_settings.scale_length = 1.0
bpy.context.scene.view_settings.view_transform = "Standard"

blend = output / "ap03-apartment.blend"
glb = output / "ap03-apartment.glb"
save_result = bpy.ops.wm.save_as_mainfile(filepath=str(blend))
if "FINISHED" not in save_result or not blend.is_file() or blend.stat().st_size == 0:
    raise RuntimeError("AP03: Blender no pudo guardar el .blend correctamente")

export_result = bpy.ops.export_scene.gltf(filepath=str(glb), export_format="GLB", export_yup=True)
if "FINISHED" not in export_result or not glb.is_file() or glb.stat().st_size == 0:
    raise RuntimeError("AP03: Blender no pudo exportar el .glb correctamente")

manifest = {
    "project": "LUMIA Companion Space",
    "stage": "AP-03",
    "source": "original procedural sample; not derived from Matterport",
    "blender_file": blend.name,
    "glb_file": glb.name,
    "coordinate_system": "Three.js +Y up / Blender +Z up, converted by glTF exporter",
    "length_unit": "meter",
    "scene_root": root.name,
    "collision_contract": "AP02 fixed AABB; do not alter layout unless collisions are updated",
    "door": "dynamic Three.js object; not part of Blender static scene",
}
(output / "ap03-manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print("AP03_OK Blender: " + str(blend))
print("AP03_OK GLB: " + str(glb))
print("AP03_OK manifest: " + str(output / "ap03-manifest.json"))
