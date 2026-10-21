#!/usr/bin/env python3
"""Crop uniform studio matte from product JPGs (background only, not subjects)."""

from __future__ import annotations

import argparse
import math
import sys
from pathlib import Path

from PIL import Image


def trim_matte_box(
    im: Image.Image,
    *,
    tolerance: float = 22,
    pad: int = 12,
    empty_ratio: float = 0.985,
) -> tuple[int, int, int, int]:
    im = im.convert("RGB")
    w, h = im.size
    px = im.load()
    corners = [px[0, 0], px[w - 1, 0], px[0, h - 1], px[w - 1, h - 1]]
    bg = tuple(sum(c[i] for c in corners) // 4 for i in range(3))

    def dist(p: tuple[int, int, int]) -> float:
        return math.sqrt(sum((p[i] - bg[i]) ** 2 for i in range(3)))

    def row_empty(y: int) -> bool:
        n = sum(1 for x in range(w) if dist(px[x, y]) <= tolerance)
        return n / w >= empty_ratio

    def col_empty(x: int) -> bool:
        n = sum(1 for y in range(h) if dist(px[x, y]) <= tolerance)
        return n / h >= empty_ratio

    top = 0
    while top < h and row_empty(top):
        top += 1
    bottom = h - 1
    while bottom > top and row_empty(bottom):
        bottom -= 1
    left = 0
    while left < w and col_empty(left):
        left += 1
    right = w - 1
    while right > left and col_empty(right):
        right -= 1

    if right <= left or bottom <= top:
        return (0, 0, w, h)

    top = max(0, top - pad)
    left = max(0, left - pad)
    bottom = min(h - 1, bottom + pad)
    right = min(w - 1, right + pad)
    return (left, top, right + 1, bottom + 1)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("input", type=Path)
    parser.add_argument(
        "-o",
        "--output",
        type=Path,
        help="Defaults to in-place overwrite of input",
    )
    parser.add_argument("--quality", type=int, default=92)
    args = parser.parse_args()

    src = args.input.expanduser().resolve()
    out = (args.output or src).expanduser().resolve()

    im = Image.open(src)
    box = trim_matte_box(im)
    cropped = im.crop(box)
    if src.suffix.lower() in {".jpg", ".jpeg"}:
        cropped.save(out, quality=args.quality, subsampling=0)
    else:
        cropped.save(out)
    print(f"trimmed {src.name}: {im.size} -> {cropped.size} box={box}", file=sys.stderr)


if __name__ == "__main__":
    main()
