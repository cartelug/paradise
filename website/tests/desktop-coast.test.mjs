import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import sharp from 'sharp';
const root = new URL('../', import.meta.url);
const read = file => readFile(new URL(file, root), 'utf8');
const assets = JSON.parse(await read('src/data/desktop-coast.json'));

test('the new illustrative desktop assets have intact masters and undistorted exports without enlargement', async () => {
  assert.equal(assets.length, 2);
  for (const asset of assets) {
    const original = new URL(`source-assets/v45-desktop-coast/${asset.file}`, root);
    assert.equal(createHash('sha256').update(await readFile(original)).digest('hex'), asset.sha256);
    assert.match(asset.source, /AI-generated illustrative/);
    const master = await sharp(original.pathname).metadata();
    for (const width of asset.widths) for (const ext of ['avif', 'webp']) {
      assert.ok(width <= master.width);
      const image = await sharp(new URL(`public/images/${asset.prefix}-${width}.${ext}`, root).pathname).metadata();
      assert.equal(image.width, width);
      assert.ok(Math.abs(image.height - width * master.height / master.width) <= 1);
    }
  }
});

test('the opening and Zanzibar share their approved imagery across devices', async () => {
  const html = await read('../index.html');
  assert.equal((html.match(/class="coastal-opening-scene"/g) || []).length, 1);
  const scene = html.match(/<picture class="coastal-opening-scene"[\s\S]*?<\/picture>/)?.[0];
  assert.doesNotMatch(scene, /data:image\/gif|media=/);
  assert.match(scene, /pardus-v45-coastal-continuous/);
  const zanzibar = html.match(/<a class="ws-window"[^>]*destinations\/zanzibar\/[\s\S]*?<\/a>/)?.[0];
  assert.match(zanzibar, /<source type="image\/avif"[^>]*pardus-v45-zanzibar-editorial/);
  assert.doesNotMatch(zanzibar, /media=/);
  assert.match(zanzibar, /<img[^>]*src="[^"]*pardus-v45-zanzibar-editorial/);
  assert.doesNotMatch(zanzibar, /alt="[^"]*resort/);
});
