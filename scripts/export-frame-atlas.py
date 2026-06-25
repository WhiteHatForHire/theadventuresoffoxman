#!/usr/bin/env python3
"""Export Phaser atlas files from measured crop rectangles."""

from __future__ import annotations

import json
import sys
from pathlib import Path
from typing import Any

from PIL import Image


def read_spec(path: Path) -> dict[str, Any]:
    with path.open("r", encoding="utf-8") as handle:
        return json.load(handle)


def resolve_path(project_root: Path, value: str) -> Path:
    return (project_root / value).resolve()


def pack_frames(
    frames: list[tuple[str, Image.Image, dict[str, int]]],
    max_width: int,
    padding: int,
) -> tuple[int, int, dict[str, dict[str, int]]]:
    x = padding
    y = padding
    row_height = 0
    placements: dict[str, dict[str, int]] = {}
    atlas_width = 0

    for name, image, _source_rect in frames:
        width, height = image.size
        if width + padding * 2 > max_width:
            raise ValueError(f"Frame {name} is wider than max atlas width {max_width}")

        if x + width + padding > max_width:
            x = padding
            y += row_height + padding
            row_height = 0

        placements[name] = {"x": x, "y": y, "w": width, "h": height}
        atlas_width = max(atlas_width, x + width + padding)
        row_height = max(row_height, height)
        x += width + padding

    atlas_height = y + row_height + padding
    return atlas_width, atlas_height, placements


def main() -> int:
    if len(sys.argv) != 2:
        print("Usage: export-frame-atlas.py <atlas-spec.json>", file=sys.stderr)
        return 2

    project_root = Path.cwd()
    spec_path = Path(sys.argv[1]).resolve()
    spec = read_spec(spec_path)

    source_path = resolve_path(project_root, spec["source"])
    output_image_path = resolve_path(project_root, spec["outputImage"])
    output_json_path = resolve_path(project_root, spec["outputJson"])
    max_width = int(spec.get("maxWidth", 1024))
    padding = int(spec.get("padding", 4))
    quantize_colors = spec.get("quantizeColors")

    source = Image.open(source_path).convert("RGBA")
    cropped: list[tuple[str, Image.Image, dict[str, int]]] = []

    for name, rect in spec["frames"].items():
        x = int(rect["x"])
        y = int(rect["y"])
        width = int(rect["width"])
        height = int(rect["height"])
        crop = source.crop((x, y, x + width, y + height))
        cropped.append((name, crop, {"x": x, "y": y, "w": width, "h": height}))

    atlas_width, atlas_height, placements = pack_frames(cropped, max_width, padding)
    atlas = Image.new("RGBA", (atlas_width, atlas_height), (0, 0, 0, 0))

    atlas_frames: dict[str, Any] = {}
    for name, crop, source_rect in cropped:
        placement = placements[name]
        atlas.alpha_composite(crop, (placement["x"], placement["y"]))
        atlas_frames[name] = {
            "frame": placement,
            "rotated": False,
            "trimmed": False,
            "spriteSourceSize": {
                "x": 0,
                "y": 0,
                "w": placement["w"],
                "h": placement["h"],
            },
            "sourceSize": {
                "w": placement["w"],
                "h": placement["h"],
            },
            "sourceCrop": source_rect,
        }

    output_image_path.parent.mkdir(parents=True, exist_ok=True)
    output_json_path.parent.mkdir(parents=True, exist_ok=True)
    atlas_output = atlas
    if quantize_colors is not None:
        colors = int(quantize_colors)
        if colors < 2 or colors > 256:
            raise ValueError("quantizeColors must be between 2 and 256")
        atlas_output = atlas.quantize(colors=colors, method=Image.Quantize.FASTOCTREE)

    atlas_output.save(output_image_path, optimize=True)

    metadata = {
        "app": "scripts/export-frame-atlas.py",
        "version": "1",
        "image": output_image_path.name,
        "source": spec["source"],
        "size": {"w": atlas_width, "h": atlas_height},
        "scale": "1",
    }
    with output_json_path.open("w", encoding="utf-8") as handle:
        json.dump({"frames": atlas_frames, "meta": metadata}, handle, indent=2)
        handle.write("\n")

    source_pixels = source.size[0] * source.size[1]
    atlas_pixels = atlas_width * atlas_height
    saved_pixels = source_pixels - atlas_pixels
    print(
        f"Wrote {output_image_path} and {output_json_path} "
        f"({atlas_width}x{atlas_height}, saved {saved_pixels} pixels from source sheet)"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
