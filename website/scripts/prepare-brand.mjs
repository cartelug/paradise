import sharp from 'sharp';
import potrace from 'potrace';
import { mkdir, writeFile } from 'node:fs/promises';
import { promisify } from 'node:util';

// Deterministic vector reconstruction from the client-approved logo, not a new mark.
const trace = promisify(potrace.trace);
const input = process.argv[2];
if (!input) throw new Error('Pass the approved logo JPEG as the first argument.');
const width = 900, height = 370;
const { data } = await sharp(input).extract({ left: 330, top: 214, width, height }).removeAlpha().raw().toBuffer({ resolveWithObject: true });
async function contour(predicate) {
  const mask = Buffer.alloc(width * height, 255);
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    const i = (y * width + x) * 3;
    if (predicate(x, y, data[i], data[i + 1], data[i + 2])) mask[y * width + x] = 0;
  }
  const png = await sharp(mask, { raw: { width, height, channels: 1 } }).png().toBuffer();
  const svg = await trace(png, { color: '#000000', threshold: 128, turdSize: 2, optTolerance: 0.2 });
  const paths = [...svg.matchAll(/<path[^>]*d="([^"]+)"/g)].map(m => m[1]);
  if (!paths.length) throw new Error('Tracing produced an empty component.');
  return paths.join(' ');
}
const gold = (r, g, b) => r > 90 && r - b > 32 && g - b > 12 && r > g;
const navy = (r, g, b) => r < 110 && g < 150 && b > r + 12;
const leopard = await contour((_x, y, r, g, b) => y < 140 && gold(r, g, b));
const plane = await contour((_x, y, r, g, b) => y >= 170 && y < 290 && gold(r, g, b));
const tagline = await contour((_x, y, r, g, b) => y >= 305 && gold(r, g, b));
const ranges = [[0, 137], [137, 300], [300, 444], [444, 610], [610, 760], [760, 900]];
const letters = await Promise.all(ranges.map(([a, b]) => contour((x, y, r, g, blue) => x >= a && x < b && y > 140 && y < 300 && navy(r, g, blue))));
await mkdir('public/brand', { recursive: true });
await writeFile('src/data/logo.json', JSON.stringify({ leopard, plane, tagline, letters }, null, 2));
const root = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 370" fill-rule="evenodd">';
const group = (color, paths) => `<g fill="${color}">${paths.map(d => `<path d="${d}"/>`).join('')}</g>`;
for (const [name, ink, metal] of [['primary', '#082C4C', '#B49A62'], ['light', '#FAF7EF', '#C5AB77'], ['mono', '#082C4C', '#082C4C']]) {
  const svg = root + group(metal, [leopard, plane, tagline]) + group(ink, letters) + '</svg>';
  await writeFile(`public/brand/pardus-${name}.svg`, svg);
  for (const size of [512, 1024, 2048, 4096]) await sharp(Buffer.from(svg), { density: 320 }).resize(size).png().toFile(`public/brand/pardus-${name}-${size}.png`);
}
const symbol = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="170 5 600 135">${group('#B49A62', [leopard])}</svg>`;
await writeFile('public/brand/pardus-symbol.svg', symbol);
// The tiny icon uses the original A + plane, which remains recognisable at 32px.
const icon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="115 140 190 170"><rect x="115" y="140" width="190" height="170" rx="25" fill="#071D2B"/>${group('#FAF7EF', [letters[1]])}${group('#C5AB77', [plane])}</svg>`;
await writeFile('public/brand/favicon.svg', icon);
await sharp(Buffer.from(icon)).resize(180, 180, { fit: 'contain', background: '#071D2B' }).png().toFile('public/brand/apple-touch-icon.png');
console.log('Vector paths and 12 transparent PNG exports created from approved reference.');
