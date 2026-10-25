import sharp from 'sharp';
import { mkdir, writeFile, readFile, readdir, rm, access } from 'node:fs/promises';
import { dirname, resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const source = resolve(root, 'source-assets/v34-mobile-illustrated');
const output = resolve(root, 'public/images');
const partial = process.argv.includes('--partial');
const letteringOnly = process.argv.includes('--lettering-only');
const selectedArt = process.argv.find(arg => arg.startsWith('--art='))?.slice(6);
await mkdir(output, { recursive: true });
const ids = ['flights', 'resort', 'transfers', 'visas', 'yacht', 'safari', 'private-tours', 'activities', 'honeymoon', 'family', 'groups', 'corporate', 'bespoke', 'maldives', 'seychelles', 'dubai', 'east-africa', 'europe', 'zanzibar', 'personal-attention', 'thoughtful-details', 'seamless-service', 'world', 'travel-journal'];
const exists = async file => { try { await access(file); return true; } catch { return false; } };
const metadata = letteringOnly ? JSON.parse(await readFile(resolve(root, 'src/data/illustrated-home-artwork.json'), 'utf8')) : { symbols: {}, lettering: {}, backgrounds: {} };
for (const id of letteringOnly ? [] : ids) {
  const file = resolve(source, 'symbols', `${id}.png`);
  if (partial && !await exists(file)) continue;
  const original = await sharp(file).metadata();
  const stats = await sharp(file).stats();
  if (!original.hasAlpha || stats.channels[3].min !== 0 || stats.channels[3].max !== 255) throw new Error(`${id} must have genuine transparent and opaque pixels`);
  metadata.symbols[id] = { width: 384, height: 384, widths: [96, 192, 384], originalWidth: original.width, originalHeight: original.height };
  for (const width of [96, 192, 384]) {
    await sharp(file).resize({ width, height: width, fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).webp({ quality: 90, alphaQuality: 100, effort: 6 }).toFile(resolve(output, `pardus-v34-${id}-${width}.webp`));
  }
}
for (const id of ['hero-lettering', 'escape-lettering', 'who-lettering', 'who-lettering-mobile']) {
  if (selectedArt && id !== selectedArt) continue;
  const hdMaster = resolve(root, 'source-assets/v37-hd-lettering', `${id}-master.png`);
  const newMaster = resolve(root, 'source-assets/v36-immersive-lettering', `${id}-master.png`);
  if (id.startsWith('who-lettering') && !await exists(hdMaster)) continue;
  const file = await exists(hdMaster) ? hdMaster : await exists(newMaster) ? newMaster : resolve(source, `${id}-refined.png`);
  const prefix = file === hdMaster ? 'pardus-v37' : file === newMaster ? 'pardus-v36' : 'pardus-v34';
  const original = await sharp(file).metadata();
  const stats = await sharp(file).stats();
  if (!original.hasAlpha || stats.channels[3].min !== 0) throw new Error(`${id} must have transparent alpha`);
  // Remove only empty transparent padding; the generated lettering itself is unchanged.
  const { data, info } = await sharp(file).trim({ threshold: 1 }).toBuffer({ resolveWithObject: true });
  const widths = [...new Set([480, 960, 1440, info.width])].filter(w => w <= info.width);
  for (const name of await readdir(output)) {
    if (!name.startsWith(`${prefix}-${id}-`) || !name.endsWith('.webp')) continue;
    const oldWidth = Number(name.slice(`${prefix}-${id}-`.length, -5));
    if (!widths.includes(oldWidth)) await rm(resolve(output, name));
  }
  metadata.lettering[id] = { source: relative(source, file), prefix, width: info.width, height: info.height, widths };
  for (const width of widths) await sharp(data).resize({ width, withoutEnlargement: true }).webp({ quality: 96, alphaQuality: 100, effort: 6 }).toFile(resolve(output, `${prefix}-${id}-${width}.webp`));
}
for (const id of letteringOnly ? [] : ['mobile-hero', 'mobile-coast']) {
  const file = resolve(source, `${id}.png`);
  if (partial && !await exists(file)) continue;
  const { width, height } = await sharp(file).metadata();
  const widths = [...new Set([480, 768, width])].filter(w => w <= width);
  metadata.backgrounds[id] = { width, height, widths };
  for (const size of widths) {
    const image = sharp(file).resize({ width: size, withoutEnlargement: true });
    await image.clone().webp({ quality: 90, effort: 6 }).toFile(resolve(output, `pardus-v34-${id}-${size}.webp`));
    await image.clone().avif({ quality: 65, effort: 5 }).toFile(resolve(output, `pardus-v34-${id}-${size}.avif`));
  }
}
if (!partial && Object.keys(metadata.symbols).length !== 24) throw new Error('All 24 symbols are required for release');
await writeFile(resolve(root, 'src/data/illustrated-home-artwork.json'), `${JSON.stringify(metadata, null, 2)}\n`);
console.log(JSON.stringify({ symbols: Object.keys(metadata.symbols).length, lettering: metadata.lettering, backgrounds: metadata.backgrounds }));
