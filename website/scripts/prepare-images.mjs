import sharp from 'sharp';
import { stat } from 'node:fs/promises';

for (const name of ['hero', 'maldives', 'zanzibar', 'africa', 'europe', 'dubai', 'seychelles', 'corporate']) {
  for (const width of [640, 1280, 1920]) {
    const input = `public/images/${name}.jpg`;
    for (const format of ['avif', 'webp']) {
      const target = `public/images/${name}-${width}.${format}`;
      try { await stat(target); continue; } catch {}
      const image = sharp(input).rotate().resize({ width, withoutEnlargement: false });
      if (format === 'avif') await image.avif({ quality: name === 'hero' ? 57 : 52, effort: 4 }).toFile(target);
      else await image.webp({ quality: 82, effort: 4 }).toFile(target);
    }
  }
}

for (const asset of [
  { name: 'pardus-hero-desktop', widths: [1280, 1920, 2560], ratio: 16 / 9 },
  { name: 'pardus-hero-mobile', widths: [768, 1200], ratio: 9 / 16 },
]) {
  const input = `source-assets/${asset.name}.png`;
  for (const width of asset.widths) {
    const height = Math.round(width / asset.ratio);
    for (const format of ['avif', 'webp']) {
      const target = `public/images/${asset.name}-${width}.${format}`;
      try { await stat(target); continue; } catch {}
      const image = sharp(input).resize(width, height, { fit: 'cover', position: 'center' });
      if (format === 'avif') await image.avif({ quality: 70, effort: 6 }).toFile(target);
      else await image.webp({ quality: 84, effort: 6 }).toFile(target);
    }
  }
}

console.log('Responsive AVIF and WebP images ready, including art-directed hero media.');
