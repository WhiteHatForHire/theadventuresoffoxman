#!/usr/bin/env python3
"""Export transparent Rotten Borough tile/platform atlas from the AI concept sheet."""

from __future__ import annotations

import json
from pathlib import Path

from PIL import Image


PROJECT_ROOT = Path(__file__).resolve().parents[1]
SOURCE = PROJECT_ROOT / "assets/source/ai_raw/tile_rotten_borough_concept_sheet.png"
OUTPUT_DIR = PROJECT_ROOT / "assets/game/atlases/tiles/rotten_borough"
OUTPUT_IMAGE = OUTPUT_DIR / "rotten_borough_tiles_atlas.png"
OUTPUT_JSON = OUTPUT_DIR / "rotten_borough_tiles_atlas.json"

FRAMES = {
    "stoneLong": (856, 520, 268, 94),
    "stoneMid": (1150, 520, 154, 82),
    "stoneShort": (1368, 520, 130, 70),
    "stoneTiny": (972, 630, 88, 42),
    "woodLong": (1018, 48, 224, 96),
    "woodMid": (1260, 48, 226, 96),
    "woodBrace": (1228, 277, 118, 184),
}


def remove_sheet_background(image: Image.Image) -> Image.Image:
    rgba = image.convert("RGBA")
    pixels = rgba.load()
    width, height = rgba.size

    for y in range(height):
        for x in range(width):
            red, green, blue, alpha = pixels[x, y]
            channels_close = max(red, green, blue) - min(red, green, blue) < 18
            sheet_gray = 72 <= red <= 126 and 72 <= green <= 126 and 72 <= blue <= 126
            if alpha and channels_close and sheet_gray:
                pixels[x, y] = (red, green, blue, 0)

    return rgba


def trim_alpha(image: Image.Image) -> Image.Image:
    bbox = image.getbbox()
    if bbox is None:
        return image
    return image.crop(bbox)


def main() -> int:
    source = Image.open(SOURCE)
    crops: list[tuple[str, Image.Image]] = []
    for name, (x, y, width, height) in FRAMES.items():
        crop = source.crop((x, y, x + width, y + height))
        crops.append((name, trim_alpha(remove_sheet_background(crop))))

    padding = 4
    atlas_width = 512
    x = padding
    y = padding
    row_height = 0
    placements: dict[str, dict[str, int]] = {}

    for name, crop in crops:
        width, height = crop.size
        if x + width + padding > atlas_width:
            x = padding
            y += row_height + padding
            row_height = 0
        placements[name] = {"x": x, "y": y, "w": width, "h": height}
        x += width + padding
        row_height = max(row_height, height)

    atlas_height = y + row_height + padding
    atlas = Image.new("RGBA", (atlas_width, atlas_height), (0, 0, 0, 0))
    frames: dict[str, object] = {}

    for name, crop in crops:
        placement = placements[name]
        atlas.alpha_composite(crop, (placement["x"], placement["y"]))
        frames[name] = {
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
        }

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    atlas.save(OUTPUT_IMAGE, optimize=True)
    with OUTPUT_JSON.open("w", encoding="utf-8") as handle:
        json.dump(
            {
                "frames": frames,
                "meta": {
                    "app": "scripts/export-rotten-borough-tiles.py",
                    "version": "1",
                    "image": OUTPUT_IMAGE.name,
                    "source": str(SOURCE.relative_to(PROJECT_ROOT)),
                    "size": {"w": atlas_width, "h": atlas_height},
                    "scale": "1",
                },
            },
            handle,
            indent=2,
        )
        handle.write("\n")

    print(f"Wrote {OUTPUT_IMAGE} and {OUTPUT_JSON}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
