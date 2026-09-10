import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';

// 97 Design credit mark: the source badge ships on a flat white canvas.
// Background removal must only clear the canvas around the badge, not the
// white "9/7" negative space cut into the mark itself — so we flood-fill
// transparency inward from the image edges instead of keying by colour.
const input = 'source-assets/97-design-logo-source.png';
const WHITE_THRESHOLD = 244; // min per-channel value still considered "background white"
const FEATHER_BAND = 3; // px of edge dilation used to soften the antialiased rim

const img = sharp(input).ensureAlpha();
const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
const { width, height, channels } = info;
const isWhite = (i) => data[i] >= WHITE_THRESHOLD && data[i + 1] >= WHITE_THRESHOLD && data[i + 2] >= WHITE_THRESHOLD;

// Flood fill from every border pixel across connected near-white pixels only.
const background = new Uint8Array(width * height);
const stack = [];
for (let x = 0; x < width; x++) { stack.push([x, 0], [x, height - 1]); }
for (let y = 0; y < height; y++) { stack.push([0, y], [width - 1, y]); }
while (stack.length) {
  const [x, y] = stack.pop();
  if (x < 0 || y < 0 || x >= width || y >= height) continue;
  const p = y * width + x;
  if (background[p]) continue;
  const i = p * channels;
  if (!isWhite(i)) continue;
  background[p] = 1;
  stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
}

// Dilate the background mask a few px to find the antialiased rim, then
// feather alpha there by brightness instead of a hard cutout edge.
let rim = background;
for (let pass = 0; pass < FEATHER_BAND; pass++) {
  const next = Uint8Array.from(rim);
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    const p = y * width + x;
    if (rim[p]) continue;
    if ((x > 0 && rim[p - 1]) || (x < width - 1 && rim[p + 1]) || (y > 0 && rim[p - width]) || (y < height - 1 && rim[p + width])) next[p] = 2; // mark as rim, not core
  }
  rim = next;
}

const out = Buffer.alloc(width * height * 4);
for (let p = 0; p < width * height; p++) {
  const i = p * channels, o = p * 4;
  if (background[p]) {
    out[o] = out[o + 1] = out[o + 2] = out[o + 3] = 0;
  } else if (rim[p] === 2) {
    const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
    const alpha = Math.max(0, Math.min(255, Math.round(255 - (brightness - 60))));
    out[o] = data[i]; out[o + 1] = data[i + 1]; out[o + 2] = data[i + 2]; out[o + 3] = alpha;
  } else {
    out[o] = data[i]; out[o + 1] = data[i + 1]; out[o + 2] = data[i + 2]; out[o + 3] = 255;
  }
}

await mkdir('public/brand', { recursive: true });
const cutout = sharp(out, { raw: { width, height, channels: 4 } }).trim({ background: { r: 0, g: 0, b: 0, alpha: 0 } });
const meta = await cutout.clone().png().toBuffer({ resolveWithObject: true });
console.log('trimmed size:', meta.info.width, meta.info.height);
await cutout.clone().resize(240, 240, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png({ compressionLevel: 9 }).toFile('public/brand/97-design-logo.png');
await cutout.clone().resize(480, 480, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png({ compressionLevel: 9 }).toFile('public/brand/97-design-logo@2x.png');
console.log('97 Design logo (background removed) exported to public/brand/97-design-logo.png (+@2x).');
