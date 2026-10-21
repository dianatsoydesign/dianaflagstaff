#!/usr/bin/env python3
"""Make the Charisma (Loops & Threads) color photos transparent.

Michaels shoots every skein on pure white, which shows up as a white box on
the gallery's beige background. For each remote image in
src/data/charisma.json this cuts out the skein, turns the white backdrop
transparent while keeping its soft floor shadow as a semi-transparent layer,
saves it to public/yarn-images/charisma/<michaels-image-id>.webp, and points
colorImages at the local file. Photos that aren't on a white backdrop are
stored as-is.

Only remote entries are processed. `node scripts/sync-charisma.mjs` reuses any
photo already stored here, so this only needs running when the sync reports
new photos:

    source .rembg-venv/bin/activate
    python scripts/charisma-transparent.py
"""

import importlib.util
import io
import json
import os
import sys
import urllib.request
from concurrent.futures import ThreadPoolExecutor

import numpy as np
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CATALOG = os.path.join(ROOT, "src/data/charisma.json")
OUT_DIR = os.path.join(ROOT, "public/yarn-images/charisma")
PUBLIC_PREFIX = "/yarn-images/charisma"
MAX_SIZE = 1200
# Share of border pixels that must be near-white to treat the photo as a white-backdrop shot.
WHITE_BORDER_MIN = 0.8
MAX_SHADOW_ALPHA = 0.6
SHADOW_RGB = np.array([0.06, 0.05, 0.04])

_remove_bg_repo = os.path.join(
    ROOT, ".cursor/skills/remove-background/scripts/remove_bg.py"
)
_remove_bg_path = _remove_bg_repo if os.path.isfile(_remove_bg_repo) else os.path.expanduser(
    "~/.cursor/skills/remove-background/scripts/remove_bg.py"
)
spec = importlib.util.spec_from_file_location("remove_bg", _remove_bg_path)
remove_bg = importlib.util.module_from_spec(spec)
spec.loader.exec_module(remove_bg)


def download(url: str) -> Image.Image:
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=60) as res:
        return Image.open(io.BytesIO(res.read())).convert("RGB")


def white_border_share(img: Image.Image) -> float:
    a = np.asarray(img.resize((200, 200))).astype(int)
    border = np.concatenate([a[:6].reshape(-1, 3), a[-6:].reshape(-1, 3), a[:, :6].reshape(-1, 3), a[:, -6:].reshape(-1, 3)])
    return float(((border.min(1) > 235) & (np.ptp(border, 1) < 14)).mean())


def make_transparent(sess, img: Image.Image) -> Image.Image:
    src = np.asarray(img).astype(np.float64) / 255
    yarn = np.asarray(remove_bg.run_inference(sess, img)).astype(np.float64) / 255
    lum = src.mean(-1)
    shadow = np.clip((0.985 - lum) / 0.985 * 1.15, 0, MAX_SHADOW_ALPHA)
    alpha = np.maximum(yarn, shadow)
    yarn_share = np.where(alpha > 0, yarn / np.maximum(alpha, 1e-6), 0)[..., None]
    rgb = src * yarn_share + SHADOW_RGB * (1 - yarn_share)
    return Image.fromarray((np.dstack([rgb, alpha]) * 255).clip(0, 255).astype(np.uint8), "RGBA")


def main() -> None:
    os.makedirs(OUT_DIR, exist_ok=True)
    with open(CATALOG) as f:
        catalog = json.load(f)

    jobs = [
        (yarn, i, url)
        for yarn in catalog["yarns"]
        for i, url in enumerate(yarn.get("colorImages", []))
        if url.startswith("http")
    ]
    print(f"{len(jobs)} remote images to process", flush=True)
    if not jobs:
        return

    with ThreadPoolExecutor(max_workers=6) as pool:
        images = list(pool.map(lambda job: download(job[2]), jobs))

    sess = remove_bg.build_session(remove_bg.ensure_model("isnet-general-use"))
    for n, ((yarn, i, url), img) in enumerate(zip(jobs, images), 1):
        img.thumbnail((MAX_SIZE, MAX_SIZE), Image.LANCZOS)
        name = url.split("?")[0].rsplit("/", 1)[-1].rsplit(".", 1)[0] + ".webp"
        if white_border_share(img) >= WHITE_BORDER_MIN:
            make_transparent(sess, img).save(os.path.join(OUT_DIR, name), "WEBP", quality=86)
            kind = "transparent"
        else:
            img.save(os.path.join(OUT_DIR, name), "WEBP", quality=86)
            kind = "kept as-is"
        yarn["colorImages"][i] = f"{PUBLIC_PREFIX}/{name}"
        print(f"[{n}/{len(jobs)}] {name}: {kind}", flush=True)

    with open(CATALOG, "w") as f:
        f.write(json.dumps(catalog, indent=2) + "\n")
    print("Updated", os.path.relpath(CATALOG, ROOT))


if __name__ == "__main__":
    sys.exit(main())
