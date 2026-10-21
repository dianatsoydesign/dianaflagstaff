#!/usr/bin/env python3
"""Measure whether a product photo is square.

Foreground is every pixel that is not the corner background color.
Prints width, height, and foreground fraction. Exit 0 when the file is
square. Foreground under 0.50 is reported and does not fail the check.
Exit 1 when the file is not square.

--crop writes the largest centered square that keeps the whole subject.
It does not refuse a crop just because the subject would fill under half
the frame.
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

import numpy as np
from PIL import Image

BG_DISTANCE = 18


def load(path: Path) -> np.ndarray:
    return np.asarray(Image.open(path).convert("RGB")).astype(np.float32)


def foreground(im: np.ndarray) -> np.ndarray:
    corners = np.stack([im[5, 5], im[5, -6], im[-6, 5], im[-6, -6]])
    bg = corners.mean(axis=0)
    dist = np.sqrt(((im - bg) ** 2).sum(axis=2))
    return dist > BG_DISTANCE


def report(path: Path) -> tuple[np.ndarray, np.ndarray, bool]:
    im = load(path)
    h, w, _ = im.shape
    fg = foreground(im)
    fraction = float(fg.mean())
    square = h == w
    ok = square
    print(
        f"{path.name}: {w}x{h} square={square} "
        f"foreground={fraction:.2f} ok={ok}"
    )
    return im, fg, ok


def crop_square(im: np.ndarray, fg: np.ndarray) -> np.ndarray | None:
    h, w, _ = im.shape
    ys, xs = np.where(fg)
    if len(ys) == 0:
        return None
    top, bottom = int(ys.min()), int(ys.max())
    left, right = int(xs.min()), int(xs.max())
    side = max(bottom - top + 1, right - left + 1)
    if side > h or side > w:
        return None
    # Center on the subject, then clamp inside the photo.
    cy = (top + bottom) // 2
    cx = (left + right) // 2
    y0 = min(max(cy - side // 2, 0), h - side)
    x0 = min(max(cx - side // 2, 0), w - side)
    return im[y0 : y0 + side, x0 : x0 + side]


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("image", type=Path)
    parser.add_argument("--crop", type=Path, help="Write a centered square crop")
    args = parser.parse_args()
    path = args.image.expanduser().resolve()
    if not path.is_file():
        sys.exit(f"Missing image: {path}")

    im, fg, ok = report(path)
    if args.crop is None:
        sys.exit(0 if ok else 1)

    cropped = crop_square(im, fg)
    if cropped is None:
        sys.exit("No square crop keeps the whole subject.")
    out = args.crop.expanduser().resolve()
    out.parent.mkdir(parents=True, exist_ok=True)
    Image.fromarray(cropped.astype(np.uint8)).save(out, quality=95, subsampling=0)
    report(out)


if __name__ == "__main__":
    main()
