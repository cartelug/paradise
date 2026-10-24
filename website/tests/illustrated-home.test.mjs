import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';
import sharp from 'sharp';
import { build } from 'esbuild';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const meta = JSON.parse(await readFile(resolve(root, 'src/data/illustrated-home-artwork.json'), 'utf8'));
const bundle = await build({ entryPoints: [resolve(root, 'src/data/home-illustrations.ts')], bundle: true, write: false, format: 'esm', platform: 'node', logLevel: 'silent' });
const { symbolIds, serviceArt } = await import(`data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text).toString('base64')}`);
const html = await readFile(resolve(root, '../index.html'), 'utf8');

test('all 24 distinct generated symbols have transparent masters and optimised responsive exports', async () => {
  assert.equal(symbolIds.length, 24);
  assert.equal(new Set(symbolIds).size, 24);
  assert.deepEqual(Object.keys(meta.symbols).sort(), [...symbolIds].sort());
  for (const id of symbolIds) {
    const file = resolve(root, 'source-assets/v34-mobile-illustrated/symbols', `${id}.png`);
    const master = await sharp(file).metadata();
    const channels = (await sharp(file).stats()).channels;
    assert.equal(master.hasAlpha, true, id);
    assert.equal(channels[3].min, 0, id);
    assert.equal(channels[3].max, 255, id);
    for (const width of meta.symbols[id].widths) {
      const output = resolve(root, 'public/images', `pardus-v34-${id}-${width}.webp`);
      const image = await sharp(output).metadata();
      assert.equal(image.width, width, id);
      assert.equal(image.height, width, id);
      assert.equal(image.hasAlpha, true, id);
      if (width === 192) assert.ok((await stat(output)).size < 80000, `${id} should remain a small mobile asset`);
    }
  }
});

test('every generated symbol is actually used on the homepage with decorative image semantics', () => {
  const rendered = [...html.matchAll(/<img[^>]*data-art-symbol="([^"]+)"[^>]*>/g)];
  assert.deepEqual(rendered.map(match => match[1]).sort(), [...symbolIds].sort());
  for (const [markup] of rendered) {
    assert.match(markup, /alt=""/);
    assert.match(markup, /aria-hidden="true"/);
    assert.match(markup, /srcset=/);
  }
  assert.equal(Object.keys(serviceArt).length, 13);
});

test('designed headings retain their exact semantic text and genuine transparent lettering', async () => {
  for (const id of ['hero-lettering', 'escape-lettering']) {
    const master = resolve(root, 'source-assets/v34-mobile-illustrated', meta.lettering[id].source);
    assert.equal((await sharp(master).metadata()).hasAlpha, true);
    assert.equal((await sharp(master).stats()).channels[3].min, 0);
    for (const width of meta.lettering[id].widths) {
      const image = await sharp(resolve(root, 'public/images', `pardus-v34-${id}-${width}.webp`)).metadata();
      assert.equal(image.hasAlpha, true);
      assert.ok(Math.abs(image.height - width * meta.lettering[id].height / meta.lettering[id].width) <= 1);
    }
  }
  const h1 = html.match(/<h1\b[^>]*id="hero-title"[\s\S]*?<\/h1>/)?.[0];
  assert.ok(h1);
  assert.match(h1, /class="art-heading-copy"/);
  assert.match(h1.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' '), /Extraordinary journeys\. Personally curated\./);
  assert.doesNotMatch(h1, /art-heading-visual|<img/);
  assert.equal((html.match(/<h1\b/g) || []).length, 1);
});

test('the mobile hero and coastal continuation use separate native portrait artwork', async () => {
  for (const id of ['mobile-hero', 'mobile-coast']) {
    const master = await sharp(resolve(root, 'source-assets/v34-mobile-illustrated', `${id}.png`)).metadata();
    assert.equal(master.width, meta.backgrounds[id].width);
    assert.equal(master.height, meta.backgrounds[id].height);
    assert.ok(master.height > master.width);
    for (const width of meta.backgrounds[id].widths) for (const extension of ['avif', 'webp']) {
      const image = await sharp(resolve(root, 'public/images', `pardus-v34-${id}-${width}.${extension}`)).metadata();
      assert.equal(image.width, width);
      assert.ok(Math.abs(image.height - width * master.height / master.width) <= 1);
    }
  }
  assert.match(html, /<source[^>]*media="\(max-width: 767px\)"[^>]*pardus-v34-mobile-hero-/);
  assert.match(html, /<source[^>]*media="\(max-width: 767px\)"[^>]*pardus-v34-mobile-coast-/);
});
