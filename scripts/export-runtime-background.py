#!/usr/bin/env python3
"""Export optimized runtime backgrounds from accepted source art."""

from __future__ import annotations

from pathlib import Path

from PIL import Image


PROJECT_ROOT = Path.cwd()
SOURCE = PROJECT_ROOT / "assets/source/concepts/bg_rotten_borough_mood.png"
OUTPUT = PROJECT_ROOT / "assets/game/backgrounds/rotten_borough/bg_rotten_borough_mood_runtime.webp"
RUNTIME_SIZE = (1280, 720)


def main() -> int:
    source = Image.open(SOURCE).convert("RGB")
    runtime = source.resize(RUNTIME_SIZE, Image.Resampling.LANCZOS)

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    runtime.save(OUTPUT, "WEBP", quality=82, method=6)

    source_pixels = source.size[0] * source.size[1]
    runtime_pixels = runtime.size[0] * runtime.size[1]
    print(
        f"Wrote {OUTPUT} ({runtime.size[0]}x{runtime.size[1]}, "
        f"saved {source_pixels - runtime_pixels} pixels from source)"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
