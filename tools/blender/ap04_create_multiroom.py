# SPDX-License-Identifier: MIT
r"""AP-04: generate ORIGINAL editable multiroom apartment and GLB.
Usage: blender --background --factory-startup --python tools/blender/ap04_create_multiroom.py
No Matterport assets are used. The JSON scene is fictitious.
"""
from pathlib import Path
import json
import sys
import bpy

PROJECT_ROOT = Path(__file__).resolve().parents[2]
SOURCE = PROJECT_ROOT / "src" / "ap04" / "layout.json"
args = sys.argv
output = Path(args[args.index("--") + 1]).expanduser() if "--" in args and len(args) > args.index("--") + 1 else PROJECT_ROOT / "local-export" / "ap04"
output.mkdir(parents=True, exist_ok=True)
layout = json.loads(SOURCE.read_text(encoding="utf-8"))
if layout.get("schema") != "lumia-apartment-ap04-v1" or layout.get("units") != "meters":
    raise RuntimeError("Invalid AP-04 layout or units")
bpy.ops.object.select_all(action="SELECT")
bpy.ops.object.delete(use_global=False)
for material in list(bpy.data.materials):
    bpy.data.materials.remove(material)
root = bpy.data.objects.new("AP04_Apartment_Root", None)
bpy.context.scene.collection.objects.link(root)
cache = {}
def material_for(hexcode):
    if hexcode not in cache:
        rgb = tuple(int(hexcode[i:i + 2], 16) / 255 for i in (1, 3, 5))
        m = bpy.data.materials.new("AP04_" + hexcode[1:])
        m.diffuse_color = (*rgb, 1)
        if m.node_tree:
            shader = m.node_tree.nodes.get("Principled BSDF")
            if shader:
                shader.inputs["Base Color"].default_value = (*rgb, 1)
                shader.inputs["Roughness"].default_value = 0.84
        cache[hexcode] = m
    return cache[hexcode]
def cube(name, center, size, color):
    x, y, z = center
    sx, sy, sz = size
    # Three.js has +Y up and Blender has +Z up.
    bpy.ops.mesh.primitive_cube_add(size=1, location=(x, -z, y))
    obj = bpy.context.object
    obj.name = name
    obj.dimensions = (sx, sz, sy)
    obj.data.materials.append(material_for(color))
    obj.parent = root
    return obj
for room in layout["rooms"]:
    b = room["bounds"]
    cube("floor_" + room["id"],
         [(b["minX"] + b["maxX"]) / 2, -0.08, (b["minZ"] + b["maxZ"]) / 2],
         [b["maxX"] - b["minX"], 0.16, b["maxZ"] - b["minZ"]],
         room["floorColor"])
for obj in layout["walls"]:
    cube(obj["id"], obj["center"], obj["size"], obj["color"])
for obj in layout["furniture"]:
    cube(obj["id"], obj["center"], obj["size"], obj["color"])
# Dynamic doors and capsule character are intentionally NOT in the GLB.
bpy.context.scene.unit_settings.system = "METRIC"
bpy.context.scene.unit_settings.scale_length = 1.0
bpy.context.scene.view_settings.view_transform = "Standard"
blend = output / "ap04-multiroom.blend"
glb = output / "ap04-multiroom.glb"
if "FINISHED" not in bpy.ops.wm.save_as_mainfile(filepath=str(blend)):
    raise RuntimeError("Could not save AP-04 .blend")
if "FINISHED" not in bpy.ops.export_scene.gltf(filepath=str(glb), export_format="GLB", export_yup=True):
    raise RuntimeError("Could not export AP-04 GLB")
for file in (blend, glb):
    if not file.is_file() or file.stat().st_size <= 0:
        raise RuntimeError("Output missing or empty: " + str(file))
manifest = {
    "stage": "AP-04",
    "schema": layout["schema"],
    "rooms": len(layout["rooms"]),
    "doors": len(layout["doors"]),
    "units": "meters",
    "origin": "Original fictitious multiroom lab, not derived from Matterport"
}
(output / "ap04-manifest.json").write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
print("AP04_OK BLEND: " + str(blend))
print("AP04_OK GLB: " + str(glb))
print("AP04_OK rooms: " + str(len(layout["rooms"])))
