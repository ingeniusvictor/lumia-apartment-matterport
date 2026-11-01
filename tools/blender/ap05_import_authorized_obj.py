# SPDX-License-Identifier: MIT
r"""AP-05 - Local, permission-gated import of a licensed Wavefront OBJ model.

No Matterport tour URLs are visited and no downloads are attempted.
Use an OBJ/MTL/textures obtained from a rights holder through an authorized route.

Blender 5.2+ example:
  blender --background --factory-startup --python tools/blender/ap05_import_authorized_obj.py -- --source "C:\private\pilot\model.obj" --confirm-rights

Optional:
  --output-dir "D:\private\ap05" --unit-scale 1.0

The exported GLB is a REVIEW MODEL ONLY. It has no verified collision,
door, room, orientation, or scale contract until the owner approves measurements.
"""
import argparse
import json
import math
import sys
from pathlib import Path

import bpy
from mathutils import Vector


def arguments():
    argv = sys.argv
    cli = argv[argv.index("--") + 1:] if "--" in argv else []
    parser = argparse.ArgumentParser(description="Import a legally obtained OBJ in Blender 5.2+")
    parser.add_argument("--source", type=Path, required=True, help="Authorized .obj file; keep .mtl and textures next to it")
    parser.add_argument("--output-dir", type=Path, default=None, help="Local output folder (default: local-export/ap05)")
    parser.add_argument("--unit-scale", type=float, default=1.0, help="Source scale multiplier, default 1.0 (not an asserted unit)")
    parser.add_argument("--confirm-rights", action="store_true", help="Confirm you have permission to adapt/export the source")
    return parser.parse_args(cli)


def main():
    args = arguments()
    if not args.confirm_rights:
        raise RuntimeError("AP05: authorization required. Provide --confirm-rights only with valid permission.")
    source = args.source.expanduser().resolve(strict=True)
    if not source.is_file() or source.suffix.lower() != ".obj":
        raise RuntimeError("AP05: --source must point to an existing authorized .obj file")
    if not math.isfinite(args.unit_scale) or args.unit_scale <= 0 or args.unit_scale > 1000:
        raise RuntimeError("AP05: invalid --unit-scale")
    output_dir = (args.output_dir.expanduser() if args.output_dir else
                  Path(__file__).resolve().parents[2] / "local-export" / "ap05")
    output_dir.mkdir(parents=True, exist_ok=True)

    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)
    imported = bpy.ops.wm.obj_import(filepath=str(source), global_scale=args.unit_scale)
    if "FINISHED" not in imported:
        raise RuntimeError("AP05: Blender OBJ importer did not finish")

    meshes = [obj for obj in bpy.context.scene.objects if obj.type == "MESH"]
    if not meshes:
        raise RuntimeError("AP05: OBJ contains no usable mesh")
    bpy.context.view_layer.update()

    min_corner = [float("inf")] * 3
    max_corner = [float("-inf")] * 3
    for obj in meshes:
        for corner in obj.bound_box:
            world = obj.matrix_world @ Vector(corner)
            for axis in range(3):
                min_corner[axis] = min(min_corner[axis], float(world[axis]))
                max_corner[axis] = max(max_corner[axis], float(world[axis]))
    spans = [max_corner[axis] - min_corner[axis] for axis in range(3)]
    if not all(math.isfinite(v) for v in spans) or max(spans) <= 0:
        raise RuntimeError("AP05: imported mesh has invalid bounds")

    missing_images = [img.name for img in bpy.data.images if img.source == "FILE" and not img.has_data]
    # Keep full texture references in the editable file, when authorized and accessible.
    bpy.ops.file.pack_all()

    blend_path = output_dir / "ap05-authorized-pilot.blend"
    glb_path = output_dir / "ap05-authorized-pilot.glb"
    if "FINISHED" not in bpy.ops.wm.save_as_mainfile(filepath=str(blend_path)):
        raise RuntimeError("AP05: could not save BLEND")
    if "FINISHED" not in bpy.ops.export_scene.gltf(
        filepath=str(glb_path), export_format="GLB", export_yup=True,
        export_animations=False, export_cameras=False, export_lights=False
    ):
        raise RuntimeError("AP05: could not export GLB")
    for artifact in [blend_path, glb_path]:
        if not artifact.is_file() or artifact.stat().st_size <= 0:
            raise RuntimeError("AP05: output missing or empty: " + artifact.name)

    manifest = {
        "phase": "AP-05",
        "source_kind": "user_supplied_authorized_OBJ",
        "rights_confirmed_by_operator": True,
        "source_filename": source.name,
        "source_size_bytes": source.stat().st_size,
        "unit_scale_multiplier": args.unit_scale,
        "units_verified": False,
        "axes_verified": False,
        "collisions_calibrated": False,
        "meshes": len(meshes),
        "vertices": sum(len(o.data.vertices) for o in meshes),
        "triangles_estimated": sum(sum(max(0, len(p.vertices) - 2) for p in o.data.polygons) for o in meshes),
        "bounds_blender_xyz": {"min": min_corner, "max": max_corner, "extent": spans},
        "missing_texture_names": missing_images,
        "blend_file": blend_path.name,
        "glb_file": glb_path.name,
        "note": "Preview only; do not reuse AP04 navigation AABBs for this geometry."
    }
    manifest_path = output_dir / "ap05-import-manifest.json"
    manifest_path.write_text(json.dumps(manifest, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print("AP05_OK BLEND: " + str(blend_path))
    print("AP05_OK GLB: " + str(glb_path))
    print("AP05_OK manifest: " + str(manifest_path))
    print("AP05_OK mesh count: " + str(len(meshes)))
    if missing_images:
        print("AP05_WARNING missing image textures: " + ", ".join(missing_images))


if __name__ == "__main__":
    main()
