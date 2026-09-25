import sharp from 'sharp';
import { stat } from 'node:fs/promises';

for (const name of ['hero', 'maldives', 'zanzibar', 'africa', 'europe', 'dubai', 'seychelles', 'corporate']) {
  for (const width of [640, 1280, 1920]) {
    const input = `public/images/${name}.jpg`;
    for (const format of ['avif', 'webp']) {
      const target = `public/images/${name}-${width}.${format}`;
      try { await stat(target); continue; } catch {}
      // Every <Picture> frame crops to landscape, so normalise sources to one 3:2 ratio:
      // portrait originals otherwise ship pixels that are never visible, and the intrinsic
      // width/height in Picture.astro cannot describe the whole set.
      const image = sharp(input).rotate()
        .resize(width, Math.round(width / (3 / 2)), { fit: 'cover', position: 'centre' });
      if (format === 'avif') await image.avif({ quality: name === 'hero' ? 57 : 52, effort: 4 }).toFile(target);
      else await image.webp({ quality: 82, effort: 4 }).toFile(target);
    }
  }
}

const scenes = ['section-3-sandbank'];
for (const name of scenes) {
  for (const asset of [
    { variant: 'desktop', widths: [960, 1280, 1672], ratio: 1672 / 941 },
    { variant: 'mobile', widths: [480, 720, 941], ratio: 941 / 1672 },
  ]) {
    const input = `source-assets/${name}-${asset.variant}.png`;
    for (const width of asset.widths) {
      const height = Math.round(width / asset.ratio);
      for (const format of ['avif', 'webp']) {
        const target = `public/images/${name}-${asset.variant}-${width}.${format}`;
        try { await stat(target); continue; } catch {}
        const image = sharp(input).resize(width, height, { fit: 'cover', position: 'center', withoutEnlargement: true });
        if (format === 'avif') await image.avif({ quality: 65, effort: 6 }).toFile(target);
        else await image.webp({ quality: 84, effort: 6 }).toFile(target);
      }
    }
  }
}

console.log('Responsive AVIF and WebP images ready, including the art-directed Travel.Explore scene.');
