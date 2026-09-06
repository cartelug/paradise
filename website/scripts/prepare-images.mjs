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
console.log('Responsive AVIF and WebP images ready.');
