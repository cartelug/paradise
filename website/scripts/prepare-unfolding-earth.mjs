import sharp from 'sharp';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const source = resolve(root, 'source-assets/v32-unfolding-earth');
const output = resolve(root, 'public/images');
await mkdir(output, { recursive: true });
const metadata = {};
for (const scene of ['desktop', 'mobile']) {
  const master = resolve(source, `${scene}-master.png`);
  const { width, height } = await sharp(master).metadata();
  const widths = [...new Set([...(scene === 'desktop' ? [960, 1280] : [640, 1024]), width])].filter(w => w <= width);
  metadata[scene] = { width, height, widths };
  for (const size of widths) {
    const image = sharp(master).resize({ width: size, withoutEnlargement: true });
    await image.clone().webp({ quality: 92, effort: 6 }).toFile(resolve(output, `pardus-unfolding-${scene}-${size}.webp`));
    await image.clone().avif({ quality: 68, effort: 6 }).toFile(resolve(output, `pardus-unfolding-${scene}-${size}.avif`));
  }
}
await writeFile(resolve(root, 'src/data/unfolding-earth-artwork.json'), `${JSON.stringify(metadata, null, 2)}\n`);
console.log(JSON.stringify(metadata));
