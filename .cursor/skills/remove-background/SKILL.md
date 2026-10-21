---
name: remove-background
description: Remove the background from a photo using rembg and ONNX models, preserving the original resolution and producing a transparent PNG with crisp edges. Use when the user asks to remove a background, cut out a subject, make a photo transparent, isolate a person, or create a no-bg version of an image.
---

# Remove Background

## Quick start

Use the `scripts/remove_bg.py` utility. It handles the ONNX threading issues that cause `rembg`'s default Python API and CLI to hang on Apple Silicon Macs.

```bash
cd <workspace-with-venv>
source .rembg-venv/bin/activate
python .cursor/skills/remove-background/scripts/remove_bg.py \
  <input_image_path> \
  <output_image_path>
```

The output is a PNG at the original input resolution with a transparent background and crisp outlines.

## Setup (first time per workspace)

```bash
python3 -m venv .rembg-venv
source .rembg-venv/bin/activate
pip install "rembg[cpu]" pillow onnxruntime numpy
```

Do not install `rembg[gpu]` or `gradio`. The rembg CLI pulls in gradio, which has a broken import chain with newer `huggingface_hub` and fails at startup.

## Model selection

The utility script defaults to `isnet-general-use` (179 MB). It produces crisp edges at 1024x1024 native resolution and runs ~5s on CPU for a 1-megapixel image.

| Model | Size | Speed (CPU) | Best for |
|-------|------|-------------|----------|
| `isnet-general-use` (default) | 179 MB | ~5s | General use, crisp edges, portraits |
| `u2net` | 176 MB | ~4s | Fallback, slightly softer edges |
| `u2net_human_seg` | 176 MB | ~4s | Human-only subjects |
| `birefnet-portrait` | 973 MB | 15+ min | Highest quality, too slow on CPU without GPU |

Avoid `birefnet-*` unless the machine has a GPU. On an M-series Mac with CPU only, session load alone exceeds 15 min.

To switch models, pass `--model <name>`:

```bash
python .cursor/skills/remove-background/scripts/remove_bg.py input.png output.png --model u2net_human_seg
```

## Critical: Why not use the rembg API directly

The naive approach hangs on Apple Silicon:

```python
from rembg import remove, new_session
session = new_session('isnet-general-use')
output = remove(input_bytes, session=session)
```

This spins forever because `rembg` lets ONNX Runtime use default threading and graph optimizations. The fix is to load the ONNX model directly with these session options:

```python
opts = ort.SessionOptions()
opts.intra_op_num_threads = 1
opts.inter_op_num_threads = 1
opts.graph_optimization_level = ort.GraphOptimizationLevel.ORT_DISABLE_ALL
```

The utility script applies these automatically.

## Preserving resolution

Do not use `rembg`'s default output directly. It internally does:
1. Resize input to model input size (usually 320 or 1024)
2. Run inference to produce a low-res mask
3. Resize mask back to original size

Step 3 uses default resampling, which softens edges. The utility script:
1. Keeps the original image unmodified
2. Resizes the 1024x1024 mask back to original size with LANCZOS
3. Applies a mild contrast stretch on the mask (clip 20–235 to 0–255) for crisp edges
4. Uses the mask as the alpha channel of the original full-resolution image

This preserves every pixel of the original image and only affects the alpha channel.

## Verification

After running, always verify the output matches the input resolution:

```bash
python -c "from PIL import Image; a=Image.open('input.png'); b=Image.open('output.png'); print(f'{a.size} -> {b.size}, mode={b.mode}'); assert a.size == b.size and b.mode == 'RGBA'"
```

## Troubleshooting

**Script hangs at "Loading model":** The `~/.u2net/` cache is corrupt or ONNX is trying to use multithreading. Delete the cached model file (`~/.u2net/<model>.onnx`) and rerun. If still hanging, confirm `intra_op_num_threads=1` is set.

**Output has jagged edges on hair:** Either lower the contrast stretch in the script (change `20, 235` to `10, 245`), or switch to `birefnet-portrait` if a GPU is available.

**Output is lower resolution than input:** The script output was overwritten by a different tool, or resolution assertion failed silently. Re-run the script and check the printed output size.
