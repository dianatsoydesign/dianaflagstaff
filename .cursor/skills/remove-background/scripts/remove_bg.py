#!/usr/bin/env python3
"""Remove background from an image at full resolution with crisp edges.

Bypasses rembg's Python API to avoid ONNX Runtime hangs on Apple Silicon.
Loads the ONNX model directly with single-threaded execution and disabled
graph optimizations, then composes the mask onto the original full-res
image as the alpha channel.

Usage:
    python remove_bg.py <input> <output> [--model <name>]

Requires: rembg (for model download), onnxruntime, pillow, numpy
"""

import argparse
import os
import sys
import time

os.environ.setdefault("OMP_NUM_THREADS", "1")

import numpy as np
import onnxruntime as ort
from PIL import Image, ImageFilter


def log(msg: str, t_start: float) -> None:
    print(f"[{time.time() - t_start:6.1f}s] {msg}", flush=True)


def ensure_model(model_name: str) -> str:
    """Download the model via rembg if not cached, return the ONNX path."""
    cache_dir = os.path.expanduser("~/.u2net")
    model_path = os.path.join(cache_dir, f"{model_name}.onnx")
    if os.path.exists(model_path):
        return model_path

    try:
        from rembg import new_session
    except ImportError:
        sys.exit(
            "rembg is required to download models. Install with: "
            "pip install 'rembg[cpu]'"
        )

    print(f"Downloading {model_name} model via rembg...", flush=True)
    new_session(model_name)
    if not os.path.exists(model_path):
        sys.exit(f"Model download failed: {model_path} not found")
    return model_path


def build_session(model_path: str) -> ort.InferenceSession:
    """Create a single-threaded ONNX session with optimizations disabled.

    These settings prevent hangs on Apple Silicon with onnxruntime 1.19+.
    """
    opts = ort.SessionOptions()
    opts.intra_op_num_threads = 1
    opts.inter_op_num_threads = 1
    opts.graph_optimization_level = ort.GraphOptimizationLevel.ORT_DISABLE_ALL
    return ort.InferenceSession(
        model_path,
        sess_options=opts,
        providers=["CPUExecutionProvider"],
    )


def run_inference(
    sess: ort.InferenceSession, img: Image.Image
) -> Image.Image:
    """Run the model and return a grayscale mask sized to the input image."""
    orig_w, orig_h = img.size
    input_info = sess.get_inputs()[0]
    shape = input_info.shape
    model_size = shape[2] if isinstance(shape[2], int) else 1024

    resized = img.resize((model_size, model_size), Image.LANCZOS)
    arr = np.asarray(resized).astype(np.float32) / 255.0
    arr = (arr - 0.5) / 1.0
    arr = arr.transpose(2, 0, 1)[None, ...]

    outputs = sess.run(None, {input_info.name: arr})
    mask = outputs[0][0, 0]
    m_min, m_max = mask.min(), mask.max()
    mask = (mask - m_min) / (m_max - m_min + 1e-8)

    mask_img = Image.fromarray((mask * 255).astype(np.uint8), mode="L")
    mask_full = mask_img.resize((orig_w, orig_h), Image.LANCZOS)
    mask_full = mask_full.filter(ImageFilter.SMOOTH)

    arr = np.asarray(mask_full).astype(np.float32)
    arr = np.clip((arr - 20) * (255.0 / (235 - 20)), 0, 255).astype(np.uint8)
    return Image.fromarray(arr, mode="L")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("input", help="Input image path")
    parser.add_argument("output", help="Output PNG path")
    parser.add_argument(
        "--model",
        default="isnet-general-use",
        help="rembg model name (default: isnet-general-use)",
    )
    args = parser.parse_args()

    t0 = time.time()
    log(f"Loading model: {args.model}", t0)
    model_path = ensure_model(args.model)
    sess = build_session(model_path)
    log(f"Session ready. Input: {sess.get_inputs()[0].shape}", t0)

    img = Image.open(args.input).convert("RGB")
    orig_size = img.size
    log(f"Input image: {orig_size[0]}x{orig_size[1]}", t0)

    log("Running inference...", t0)
    mask = run_inference(sess, img)

    rgba = img.convert("RGBA")
    rgba.putalpha(mask)

    assert rgba.size == orig_size, (
        f"Resolution mismatch: {rgba.size} vs {orig_size}"
    )

    rgba.save(args.output, "PNG", optimize=False, compress_level=1)
    log(f"Saved: {args.output}", t0)

    verify = Image.open(args.output)
    size_mb = os.path.getsize(args.output) / 1024 / 1024
    log(f"Verified: {verify.size}, mode={verify.mode}, {size_mb:.2f} MB", t0)


if __name__ == "__main__":
    main()
