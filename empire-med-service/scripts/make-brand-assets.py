#!/usr/bin/env python3
"""Creates the web logo files in public/ from the master artwork in brand-source/. Needs Pillow and NumPy.
Run from the project root after replacing any master file, then run: node scripts/make-images.cjs"""
import numpy as np
from PIL import Image
Image.MAX_IMAGE_PIXELS = None

def cut_out(path, white=False):
    """Removes the white background. white=True uses darkness as coverage to make a solid white logo."""
    a = np.asarray(Image.open(path).convert('RGB')).astype(np.float32)
    if white:
        alpha = 1 - a.mean(axis=2) / 255
        rgb = np.full_like(a, 255)
    else:
        alpha = np.clip((255 - a.min(axis=2)) / 80, 0, 1)
        safe = np.maximum(alpha, 1e-3)[..., None]
        rgb = np.clip((a - 255 * (1 - alpha[..., None])) / safe, 0, 255)
    alpha[alpha < .08] = 0  # clears faint JPEG noise in the background
    ys, xs = np.where(alpha > .3)
    box = (xs.min() - 8, ys.min() - 8, xs.max() + 9, ys.max() + 9)
    im = Image.fromarray(np.dstack([rgb, alpha * 255]).round().astype(np.uint8), 'RGBA')
    return im.crop(box)

def scaled(im, w):
    h = round(im.height * w / im.width)
    return im.convert('RGBa').resize((w, h), Image.LANCZOS).convert('RGBA')

def on_white(im, size, pad):
    bg = Image.new('RGBA', (size, size), 'white')
    s = scaled(im, size - 2 * pad)
    bg.alpha_composite(s, ((size - s.width) // 2, (size - s.height) // 2))
    return bg.convert('RGB')

logo = cut_out('brand-source/logo-full-colour.jpg')
scaled(logo, 480).save('public/logo/logo.png', optimize=True)
white = cut_out('brand-source/logo-black.jpg', white=True)
scaled(white, 480).save('public/logo/logo-white.png', optimize=True)
icon = cut_out('brand-source/icon-colour.jpg')
scaled(icon, 256).save('public/logo/icon.png', optimize=True)
scaled(icon, 32).save('public/images/favicon-32.png', optimize=True)
on_white(icon, 180, 18).save('public/images/apple-touch-icon.png', optimize=True)
art = Image.open('brand-source/brand-artwork.jpg').convert('RGB').resize((900, 900), Image.LANCZOS)
art.save('public/images/brand-artwork.jpg', quality=82, optimize=True, progressive=True)
print('logo', scaled(logo, 480).size, 'white', scaled(white, 480).size)
