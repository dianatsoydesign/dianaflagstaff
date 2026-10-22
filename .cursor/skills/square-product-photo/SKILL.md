---
name: product-photo-edit
description: Automates product photography workflows for a crochet business. Standardizes white balance, lighting, and margins (60–65% padding) across 1:1 square assets to match the soft neutral off-white backdrop of the elf-hat master photo (`public/products/elf-hat/hero-studio-v6.jpg`), while locking true yarn hues (e.g., Eucalyptus Green, Terracotta) and normalizing hand model nail polish.
---

# # Square Product Photo & Visual Consistency Rule

## Objective

Standardize image exposure, background appearance, and white balance across all inputs while locking the exact color and texture of the crocheted yarn as the true baseline. Ensure mathematically precise product centering, uniform composition padding, a unified signature background tone, digital fabric spot-cleaning, and automated file versioning across all public/products/ assets.

---

## 1. Catalog Style & Color Directives

### Master Visual Anchor Baselines (AI Judgment Standards)

* **The Absolute Standard**: Use **`public/products/elf-hat/hero-studio-v6.jpg`** as the exclusive master reference for background white balance, background tone, and lighting quality. Inspect this exact image before editing. Match its soft neutral off-white background with a subtle warm-gray cast. Sample the unobstructed background, not the hat, skin, or clothing. This reference governs the background and lighting only; retain each product’s designated true yarn-color reference. 

* **Automatic Deviation Correction**: Before editing any new photo, the AI must evaluate it directly against the elf-hat master photo (`public/products/elf-hat/hero-studio-v6.jpg`) and execute autonomous corrections without user prompts:

  * **If an input image is too warm/pinkish**: Automatically cool down the temperature until the background matrix matches the soft neutral off-white backdrop of the elf-hat master photo.

  * **If an input image is too cold/blue/stark** (like the flat table lighting on the placemats): Automatically adjust the background midtones toward the elf-hat master photo and soften harsh shadows, without adding a yellow or pink cast.

  * **If an input image is underexposed/muddy gray**: Automatically lift the background exposure toward the elf-hat master photo, preserving its natural light falloff and grounded contact shadows.

### Universal Signature Background

* **Target Tone**: Standardize all product backgrounds to match the soft, minimalist, neutral off-white / subtle warm-gray tone in `public/products/elf-hat/hero-studio-v6.jpg`. Avoid introducing the stronger cream, yellow, or pink cast of other photos. 

* **Gradient & Vignette**: Match the subtle, natural background light falloff visible in the elf-hat master photo. Preserve a continuous surface and avoid adding an artificial ivory vignette.

### Lock Yarn Reference Color & Digital Fabric Cleaning

* **Color Integrity**: Treat the specific yarn color and texture from your designated reference profile as the absolute source of truth (e.g., *Eucalyptus Green* for coasters, *Terracotta* for hotpads, *Off-White/Natural Cream* for placemats). 

* **Stain Removal**: Spot-heal stains, discoloration (including brown/orange patches), dust, and lint on yarn and background. Blend locally with clean neighboring tones; preserve stitch texture, natural shadows, and intentional metallic/gold fibers. Avoid global color shifts.

* **Hue Locking**: The physical crocheted product's true-to-life hue and stitch clarity must remain identical and unaltered across all edited photos.

### Preserve Material Texture & Grounded Shadows

* **Detail Preservation & Slight Sharpening**: Retain sharp definition of the Bobbiny Premium 5mm cotton stitch-work, natural knit patterns, ribbed edges, and pom-pom textures with gentle crochet-only sharpening during web export (see section 5).

* **Prop Polish & Defect Removal**: Automatically detect secondary lifestyle props (such as plates, forks, spoons, cooking pots, or candles). Digitally smooth out, polish, and remove heavy scratches, fingerprints, blemishes, or unappealing surface scuffs from these objects so they look pristine and clean.

* **Dynamic Shadow Relocation**: When adjusting composition or centering an object, the contact shadows cast underneath or behind the items must remain locked to the base of the product. The AI must shift the soft, diffuse shadows right along with the item and outpaint the background underneath them so the product remains realistically grounded.

---

## 2. Framing, Composition, & Scaling Rules

* **Square Output**: The saved file must always be square (width equals height). Product `<Image>` components stay `object-contain`.

* **Proportion Protection**: Keep the product's real proportions. Never stretch, squash, shorten, widen, or reshape it. 

* **Target Padding (60–65%)**: The total bounding box of the product setup (including styled props like plates or cutlery) should ideally scale to occupy roughly **60–65%** of the frame height and width to maintain an open, luxurious gallery feel. 

* **Proportion Precedence Over Padding**: Reaching the target padding ratio is *never* a reason to alter the product shape. If the only way to reach the 60–65% frame envelope is to distort the item, stop. Empty background is the correct result.

* **Protected Elements**: Crop or extend negative space only. Never crop the product, hands, or leather tags that are part of the shot.

* **Background Continuity**: The background must stay one continuous surface from the original photo. No second panel, no flat fill, no gallery-matte color painted in. No edge mirroring or stretching.

---

## 3. Automation Workflow & Scripts

### Step 1: Decide Crop vs. Regenerate

Run the following script to measure the bounds of the subject:

```bash

python3 ".cursor/skills/square-product-photo/scripts/measure_[subject.py](http://subject.py)" "public/products/<file>.jpg"

```

* **Condition A: Already Square**: Stop the framing step, even when the foreground object coverage is under the targeted threshold. Do not regenerate a square photo just to raise that number. Proceed immediately to the **Nails** step if applicable.

* **Condition B: Clean Center Crop Fits**: If a centered square crop fits without cutting the product, hands, or tags, crop using the script:

  ```bash

  python3 ".cursor/skills/square-product-photo/scripts/measure_[subject.py](http://subject.py)" "input.jpg" --crop "output.jpg"

  ```

* **Condition C: Regenerate Needed**: Otherwise, regenerate using the image generation tool with `aspect_ratio 1:1` and the current photo as the reference image.

### Step 2: Regeneration Prompt Requirements

1. Recreate this exact product photograph (same product, colors matching the yarn profile, pose, hands, tags, clean polished props, and real proportions).

2. Square frame. Add or remove only empty background. 

3. One continuous background matching the tone and white balance of `public/products/elf-hat/hero-studio-v6.jpg`; include that image as a background reference when editing. No seams, stripes, pasted sides, or flat color blocks.

4. Do not crop, stretch, squash, shorten, or widen the product.

---

## 4. Hand & Nail Polish Standardization Routine

When nail polish is visible in the frame, recolor **only the polish pixels** to match the baseline established in `public/products/christmas-stockings/4-studio-v4.jpg`. A hand with no polish showing stays exactly as it is.

* **Precise Color Palette Constraints**:

  * **Shadow**: RGB (186, 122, 108) | **Body**: RGB (214, 148, 130) | **Highlight**: RGB (246, 214, 202)

* **Application Rule**: Most of the nail stays at the *Body* color. Leave skin tone, yarn fibers, leather tags, metallic rivets, and backgrounds completely untouched.

---

## 5. AI Edit & Web Upscale

* **Source & Edit**: Use the highest-resolution original for the AI lighting, background, color, and cleanup edit. Retain the AI master and original; follow the user’s framing instructions.
* **Web Upscale**: After approving the AI edit visually, locally resize to a 2,048 px longest edge with Lanczos (preserve aspect ratio). If already larger, downsample for the web copy. Save a separate version; never overwrite the master. This local export step is authorized by this workflow and requires no paid API.
* **Crochet Detail First**: Prioritize yarn fibers, stitch boundaries, ribs, and product edges. Apply gentle unsharp masking only through a softly feathered crochet-product mask (starting point: radius 0.9 px, amount 45%, threshold 3 at 2,048 px). Exclude skin, faces, hands, hair, props, tags, and background from sharpening. Keep human features natural; do not invent yarn texture or use aggressive clarity. Reduce sharpening if halos, ringing, or brittle fibers appear.
* **Export & Check**: JPEG quality 88–90, optimized; roughly 250–900 KB is a guideline, not a requirement. Inspect crochet at full size, check masked edges, and report dimensions/file size. Upscaling improves presentation but does not recover original camera detail. Do not reject the approved AI look solely because its native output is smaller. Preserve any user-set resolution or budget limits.

---

## 6. File Operations & Catalog State Preservation

* **Strict No-Overwrite Rule**: Always write a new versioned file. Do not overwrite the current file. Save the result under `public/products/<product>/` with the next version suffix `-vN`). 

* **Validation Check**: Run `measure_subject.py` on the newly generated asset. The file must be square. Foreground bounds below 0.60 are perfectly acceptable if it preserves true proportions. 

* **Fallback Protocol**: If the result is square but the product looks squashed, stretched, or a different shape than the reference, regenerate once with the exact same ruleset. If it still fails square verification, stop execution immediately and show the user.

* **Catalog Data Targeting**: Update only the image the user named. Point `imageSrc` or the gallery entry in `src/data/products.ts` at the new file *only* after it completely passes all validation steps.
