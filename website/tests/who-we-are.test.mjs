import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import sharp from 'sharp';

const here = new URL('../', import.meta.url);
const html = await readFile(new URL('../index.html', here), 'utf8');

test('original photographic base exports preserve every original RGB pixel', async () => {
  for (const [scene,width] of [['desktop',1536],['mobile',853]]) {
    const master=sharp(new URL(`source-assets/v35-who-we-are/${scene}-master.png`,here).pathname);
    const output=sharp(new URL(`public/images/pardus-who-${scene}-${width}.webp`,here).pathname);
    assert.deepEqual(await output.removeAlpha().raw().toBuffer(),await master.removeAlpha().raw().toBuffer(),scene);
  }
});

test('selected Window Seat introduction follows the hero with accessible live copy and a real About link', () => {
  const who = html.match(/<section class="ws-intro"[\s\S]*?<\/section>/)?.[0];
  assert.ok(who);
  assert.ok(html.indexOf('id="who-we-are"') > html.indexOf('id="hero-title"'));
  assert.ok(html.indexOf('id="who-we-are"') < html.indexOf('id="destinations"'));
  assert.match(who, /aria-labelledby="who-title"/);
  assert.match(who, /Leave <em>ordinary\.<\/em>/);
  assert.match(who, /Flights, stays, safaris and private escapes,/);
  assert.match(who, /planned around you\./);
  assert.match(who, /href="\/paradise\/about\.html"/);
  assert.equal((html.match(/<h1\b/g) || []).length, 1);
  assert.match(who, /data-ws-lettering/);
  assert.doesNotMatch(who, /pardus-who-mobile|who-backdrop/);
});

test('portrait exports keep their aspect ratio and the leopard keeps real transparency', async () => {
  const manifest = JSON.parse(await readFile(new URL('source-assets/v39-window-seat/manifest.json', here), 'utf8'));
  const { createHash } = await import('node:crypto');
  for (const source of manifest) {
    const bytes = await readFile(new URL(`source-assets/v39-window-seat/${source.file}`, here));
    assert.equal(createHash('sha256').update(bytes).digest('hex'), source.sha256, source.file);
  }
  for (const name of ['maldives', 'seychelles', 'dubai']) {
    for (const width of [224, 448, 887]) for (const ext of ['avif', 'webp']) {
      const meta = await sharp(new URL(`public/images/pardus-window-${name}-${width}.${ext}`, here).pathname).metadata();
      assert.equal(meta.width, width); assert.equal(meta.height, width * 2);
    }
  }
  const alpha = await sharp(new URL('public/images/pardus-window-leopard-640.webp', here).pathname).stats();
  assert.equal(alpha.channels[3].min, 0); assert.ok(alpha.channels[3].max > 240);
});

test('decorative headlines retain image-error and enlarged-text fallbacks, visible prices and real trip links', async () => {
  const script = await readFile(new URL('src/scripts/window-seat.ts', here), 'utf8');
  const css = await readFile(new URL('src/styles/window-seat.css', here), 'utf8');
  assert.match(script, /naturalWidth > 0/); assert.match(script, /addEventListener\('error'/);
  assert.match(css, /data-ws-large-text/); assert.match(css, /forced-colors/);
  assert.match(html, /class="ws-heading-copy">Choose <em>your view\.<\/em>/);
  assert.match(html, /class="window-seat" data-window-seat data-sticky-quiet/);
  const cards = [...html.matchAll(/<article class="ws-card"[\s\S]*?<\/article>/g)].map(m => m[0]);
  assert.equal(cards.length, 3);
  for (const [i, amount] of ['2,950', '2,450', '1,250'].entries()) {
    assert.ok(cards[i].includes('USD ' + amount));
    assert.match(cards[i], /per person/); assert.match(cards[i], /Two sharing/);
    assert.match(cards[i], /aria-describedby="ws-rate-terms"/);
  }
});
