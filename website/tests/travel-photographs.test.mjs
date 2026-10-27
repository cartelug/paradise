import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import sharp from 'sharp';

const here = new URL('../', import.meta.url);
const folder = new URL('source-assets/travel-photographs-2026-10-25/', here);
const manifest = JSON.parse(await readFile(new URL('manifest.json', folder), 'utf8'));
const registry = await readFile(new URL('src/data/travel-photographs.ts', here), 'utf8');
const entries = JSON.parse(registry.slice(registry.indexOf('= [') + 2, registry.lastIndexOf(']') + 1));
const page = name => readFile(new URL(`../${name}`, here), 'utf8');

test('the ten original PNG masters are intact and each has a prepared entry with alt text', async () => {
  assert.equal(manifest.files.length, 10);
  for (const file of manifest.files) {
    const bytes = await readFile(new URL(file.filename, folder));
    assert.equal(createHash('sha256').update(bytes).digest('hex'), file.sha256, `${file.filename} changed`);
    const entry = entries.find(item => item.asset === `${file.filename.replace('.png', '')}-v38`);
    assert.ok(entry, `${file.filename} has no registry entry`);
    assert.ok(entry.alt.length > 30 && entry.slots.length >= 1);
    assert.equal(entry.width, file.width);
  }
});

test('responsive AVIF and WebP exist at native shape, never enlarged, with no 1920 px variant', async () => {
  for (const entry of entries) {
    assert.ok(entry.widths.every(width => width <= entry.width) && Math.max(...entry.widths) === entry.width);
    for (const width of entry.widths) for (const ext of ['avif', 'webp']) {
      const file = new URL(`public/images/${entry.asset}-${width}.${ext}`, here);
      await access(file);
      const meta = await sharp(file.pathname).metadata();
      assert.equal(meta.width, width);
      assert.ok(Math.abs(meta.height - Math.round(width * entry.height / entry.width)) <= 1);
    }
    await assert.rejects(access(new URL(`public/images/${entry.asset}-1920.webp`, here)));
  }
});

test('the exported pages use the matching photograph in each destination and experience', async () => {
  const expect = {
    'destination-maldives.html': 'maldives-v38', 'destination-seychelles.html': 'seychelles-v38', 'destination-dubai.html': 'dubai-v38',
    'destination-africa.html': 'east-africa-v38', 'destination-europe.html': 'europe-v38', 'destination-zanzibar.html': 'zanzibar-v38',
    'cruises.html': 'yacht-v38', 'corporate.html': 'executive-v38', 'journey-executive-arrivals.html': 'executive-v38',
    'journey-private-island-reset.html': 'reset-v38', 'journey-celebration-in-two-acts.html': 'celebration-v38',
    'journey-family-in-the-wild.html': 'east-africa-v38', 'index.html': 'ocean-cruise-v40',
  };
  for (const [name, asset] of Object.entries(expect)) assert.match(await page(name), new RegExp(`${asset}-(640|960|1280|1586)`), `${name} should use ${asset}`);
  const home = await page('index.html');
  for (const asset of ['pardus-window-maldives', 'east-africa-v38', 'europe-v38', 'zanzibar-v38', 'reset-v38', 'celebration-v38']) assert.match(home, new RegExp(asset));
});

test('V38 pictures keep intrinsic dimensions, lazy loading, a focal point and non-empty alt on content images', async () => {
  const html = await page('destination-maldives.html');
  const imgs = [...html.matchAll(/<img[^>]*maldives-v38[^>]*>/g)].map(match => match[0]);
  assert.ok(imgs.length >= 1);
  for (const tag of imgs) {
    assert.match(tag, /width="1280"/); assert.match(tag, /height="801"/); assert.match(tag, /object-position:/);
    assert.match(tag, /alt="[^"]{20,}"/);
  }
  const srcsets = [...html.matchAll(/srcset="[^"]*maldives-v38[^"]*"/g)].map(match => match[0]);
  assert.ok(srcsets.every(value => !/1920w/.test(value) && /1586w/.test(value)));
  assert.match(await page('index.html'), /<img[^>]*(?:east-africa|europe|zanzibar)-v38-1280[^>]*loading="lazy"/);
});
