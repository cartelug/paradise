import sharp from 'sharp';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const source = resolve(root, 'source-assets/v33-photographic-coast');
const output = resolve(root, 'public/images');
await mkdir(output, { recursive: true });
const metadata = {};
for (const scene of ['desktop', 'mobile', 'coast']) {
  const master = resolve(source, `${scene}-master.png`);
  const { width, height } = await sharp(master).metadata();
  const widths = [...new Set([...(scene === 'mobile' ? [480, 768] : [960, 1440]), width])].filter(w => w <= width);
  metadata[scene] = { width, height, widths };
  for (const size of widths) {
    const image = sharp(master).resize({ width: size, withoutEnlargement: true });
    await image.clone().webp({ quality: 90, effort: 6 }).toFile(resolve(output, `pardus-coastal-${scene}-${size}.webp`));
    await image.clone().avif({ quality: 65, effort: 6 }).toFile(resolve(output, `pardus-coastal-${scene}-${size}.avif`));
  }
}
await writeFile(resolve(root, 'src/data/photographic-coast-artwork.json'), `${JSON.stringify(metadata, null, 2)}\n`);
console.log(JSON.stringify(metadata));
