#!/usr/bin/env python3
"""Builds the layered V30 hero from the V25 artwork and the V26 layer set.

The approved V25 hero is one flat picture. To animate the leopard for real it is rebuilt as layers that sit exactly
where the V25 picture had them:

  * a clean "world" plate (the V26 scene without the animal), colour-matched to V25;
  * the leopard cutout (open eyes), cropped, colour-matched and softened to the V25 look;
  * a small eye-blink patch (the closed-eye frame, feathered) that is cross-faded over the eyes.

Run from the website folder:  python3 scripts/prepare-v30-hero-layers.py
Inputs and outputs live in public/images; geometry for the CSS is written to src/data/hero-layers.json.
Requires numpy and Pillow with AVIF and WebP support.
"""
import json
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
IMAGES = ROOT / 'public' / 'images'
DATA = ROOT / 'src' / 'data' / 'hero-layers.json'
CSS = ROOT / 'src' / 'styles' / 'hero-layers.css'


def load(name, mode='RGB'):
    return Image.open(IMAGES / name).convert(mode)


def histogram_lut(source, reference, mask):
    """Per-channel look-up tables that map the source tones onto the reference tones inside the mask."""
    luts = []
    for channel in range(3):
        src = source[..., channel][mask]
        ref = reference[..., channel][mask]
        src_cdf = np.cumsum(np.bincount(src.ravel(), minlength=256).astype(np.float64))
        ref_cdf = np.cumsum(np.bincount(ref.ravel(), minlength=256).astype(np.float64))
        luts.append(np.interp(src_cdf / src_cdf[-1], ref_cdf / ref_cdf[-1], np.arange(256)).astype(np.uint8))
    return luts


def apply_luts(array, luts):
    out = array.copy()
    for channel in range(3):
        out[..., channel] = luts[channel][array[..., channel]]
    return out


def save_variants(image, stem, widths, quality=78):
    """Write WebP and AVIF at each width (the largest is the native size)."""
    for width in widths:
        resized = image if width == image.width else image.resize((width, round(image.height * width / image.width)), Image.LANCZOS)
        resized.save(IMAGES / f'{stem}-{width}.webp', 'WEBP', quality=quality, method=6)
        resized.save(IMAGES / f'{stem}-{width}.avif', 'AVIF', quality=max(40, quality - 12), speed=4)


# ---------------------------------------------------------------- world plates
desktop_v25 = np.asarray(load('pardus-hero-desktop-v25-1536.webp'))
desktop_scene = np.asarray(load('pardus-scene-desktop-v26-1536.webp'))
height, width = desktop_scene.shape[:2]
free = np.zeros((height, width), bool)
free[:, : int(width * 0.5)] = True  # the left half of the V25 picture has no animal in it
desktop_world = apply_luts(desktop_scene, histogram_lut(desktop_scene, desktop_v25, free))
save_variants(Image.fromarray(desktop_world), 'pardus-world-desktop-v30', [640, 1280, 1536])

mobile_v25 = np.asarray(load('pardus-hero-mobile-v25-1024.webp'))
mobile_scene = np.asarray(load('pardus-scene-mobile-v26-1024.webp'))
mh, mw = mobile_scene.shape[:2]
free = np.zeros((mh, mw), bool)
free[:, : int(mw * 0.42)] = True
mobile_world = apply_luts(mobile_scene, histogram_lut(mobile_scene, mobile_v25, free))
save_variants(Image.fromarray(mobile_world), 'pardus-world-mobile-v30', [480, 768, 1024])

# ---------------------------------------------------------------- leopard cutout
# The V26 cutout is the same animal as the V25 picture. Registered by image correlation it sits in V25 at
# scale 0.875 with its top-left corner at (214, 42) of the 1536 x 1024 picture.
SCALE, OFFSET_X, OFFSET_Y = 0.875, 214, 42
CROP = (840, 60, 1536, 1024)  # left, top, right, bottom of the cutout, in its own pixels
open_full = load('pardus-leopard-open-v26-1536.webp', 'RGBA')
blink_full = load('pardus-leopard-blink-v26-1536.webp', 'RGBA')

# Colour-match the cutout to the V25 face using the pixels they share.
registered = Image.new('RGBA', (1536, 1024), (0, 0, 0, 0))
resized = open_full.resize((round(open_full.width * SCALE), round(open_full.height * SCALE)), Image.LANCZOS)
registered.alpha_composite(resized, (OFFSET_X, OFFSET_Y))
face = (1090, 150, 1480, 430)
registered_face = np.asarray(registered)[face[1]:face[3], face[0]:face[2]]
solid = registered_face[..., 3] > 240
luts = histogram_lut(registered_face[..., :3], desktop_v25[face[1]:face[3], face[0]:face[2]], solid)


def grade(image, blur=0.45):
    rgba = np.asarray(image).copy()
    rgba[..., :3] = apply_luts(rgba[..., :3], luts)
    rgb = Image.fromarray(rgba[..., :3]).filter(ImageFilter.GaussianBlur(blur))
    # Pull the cutout edge in by a pixel so no background halo travels with it when it moves.
    alpha = Image.fromarray(rgba[..., 3]).filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(0.6))
    return Image.merge('RGBA', (*rgb.split(), alpha))


leopard = grade(open_full).crop(CROP)
leopard.save(IMAGES / 'pardus-leopard-v30.webp', 'WEBP', quality=88, alpha_quality=100, method=6)
leopard.save(IMAGES / 'pardus-leopard-v30.avif', 'AVIF', quality=68, speed=4)

# A small silhouette, used only as a mask for the moving light on the fur (so the light never touches the sky).
mask = leopard.resize((leopard.width // 3, leopard.height // 3), Image.LANCZOS)
silhouette = Image.new('RGBA', mask.size, (255, 255, 255, 0))
silhouette.putalpha(mask.split()[3].filter(ImageFilter.GaussianBlur(0.8)))
silhouette.save(IMAGES / 'pardus-leopard-v30-mask.webp', 'WEBP', lossless=True, method=6)

# ---------------------------------------------------------------- eye-blink patch
EYES = {'left': (1133, 300), 'right': (1321, 292)}  # iris centres in cutout pixels
PATCH = (1070, 245, 1380, 350)
patch_w, patch_h = PATCH[2] - PATCH[0], PATCH[3] - PATCH[1]
yy, xx = np.mgrid[0:patch_h, 0:patch_w]
mask = np.zeros((patch_h, patch_w), np.float64)
for cx, cy in EYES.values():
    ex, ey = (cx - PATCH[0]) / 63.0, (cy - PATCH[1]) / 40.0
    mask = np.maximum(mask, 1.0 - np.clip(np.hypot((xx - ex * 63.0) / 63.0, (yy - ey * 40.0) / 40.0), 0, 1))
mask = np.clip(mask * 2.4, 0, 1)
mask_image = Image.fromarray((mask * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(5))
blink = grade(blink_full).crop(PATCH)
opened = grade(open_full).crop(PATCH)
# Match the patch's overall tone to the open frame in the feathered ring so the edge disappears.
ring = (np.asarray(mask_image) > 20) & (np.asarray(mask_image) < 150)
shift = (np.asarray(opened)[..., :3][ring].mean(axis=0) - np.asarray(blink)[..., :3][ring].mean(axis=0))
blink_pixels = np.asarray(blink).astype(np.float64)
blink_pixels[..., :3] = np.clip(blink_pixels[..., :3] + shift, 0, 255)
patch = Image.fromarray(blink_pixels.astype(np.uint8), 'RGBA')
patch.putalpha(mask_image)
patch.save(IMAGES / 'pardus-leopard-v30-eyes.webp', 'WEBP', quality=88, alpha_quality=100, method=6)
patch.save(IMAGES / 'pardus-leopard-v30-eyes.avif', 'AVIF', quality=68, speed=4)

# ---------------------------------------------------------------- destination card thumbnails
# Small square crops for the phone price tiles (2x for a 128 px tile). Focus points are fractions of the source image.
THUMBS = {'maldives': ('maldives-v24-1280.webp', 0.5, 0.55), 'seychelles': ('seychelles-v24-1280.webp', 0.5, 0.5),
          'dubai': ('dubai-v24-1280.webp', 0.5, 0.45), 'africa': ('africa-v24-1280.webp', 0.5, 0.55),
          'zanzibar': ('zanzibar-v24-1280.webp', 0.5, 0.55), 'europe': ('europe-v24-1280.webp', 0.5, 0.5)}
for slug, (source, fx, fy) in THUMBS.items():
    photo = load(source)
    side = min(photo.size)
    left = max(0, min(photo.width - side, round(photo.width * fx - side / 2)))
    top = max(0, min(photo.height - side, round(photo.height * fy - side / 2)))
    photo.crop((left, top, left + side, top + side)).resize((256, 256), Image.LANCZOS).save(IMAGES / f'pardus-thumb-{slug}.webp', 'WEBP', quality=80, method=6)

# ---------------------------------------------------------------- geometry for the CSS
crop_w, crop_h = CROP[2] - CROP[0], CROP[3] - CROP[1]
percent = lambda value, total: round(100 * value / total, 3)
local = lambda x, y: {'x': percent(x - CROP[0], crop_w), 'y': percent(y - CROP[1], crop_h)}
geometry = {
    'note': 'Generated by scripts/prepare-v30-hero-layers.py. All values are percentages.',
    'desktop': {
        'leopard': {
            'left': percent(OFFSET_X + SCALE * CROP[0], 1536), 'top': percent(OFFSET_Y + SCALE * CROP[1], 1024),
            'width': percent(SCALE * crop_w, 1536), 'height': percent(SCALE * crop_h, 1024),
        },
    },
    'leopard': {
        'size': {'width': crop_w, 'height': crop_h},
        'eyes': {name: local(*xy) for name, xy in EYES.items()},
        'blink': {
            'left': percent(PATCH[0] - CROP[0], crop_w), 'top': percent(PATCH[1] - CROP[1], crop_h),
            'width': percent(patch_w, crop_w), 'height': percent(patch_h, crop_h),
        },
    },
}
DATA.write_text(json.dumps(geometry, indent=2) + '\n')
desk, leo = geometry['desktop']['leopard'], geometry['leopard']
CSS.write_text('/* Generated by scripts/prepare-v30-hero-layers.py: where the layers sit in the 1536 x 1024 landscape picture. */\n'
               '.hero-picture {\n'
               f"  --lx: {desk['left']}%; --ly: {desk['top']}%; --lw: {desk['width']}%; --lh: {desk['height']}%;\n"
               f"  --eye-lx: {leo['eyes']['left']['x']}%; --eye-ly: {leo['eyes']['left']['y']}%; --eye-rx: {leo['eyes']['right']['x']}%; --eye-ry: {leo['eyes']['right']['y']}%;\n"
               f"  --bl-x: {leo['blink']['left']}%; --bl-y: {leo['blink']['top']}%; --bl-w: {leo['blink']['width']}%; --bl-h: {leo['blink']['height']}%;\n"
               '}\n')
print('Wrote hero layers and', DATA.relative_to(ROOT))
print(json.dumps(geometry, indent=2))
