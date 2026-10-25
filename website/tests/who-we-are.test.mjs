import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import sharp from 'sharp';

const here = new URL('../', import.meta.url);
const html = await readFile(new URL('../index.html', here), 'utf8');
const section = html.match(/<section class="who-reference"[\s\S]*?<\/section>/)?.[0];

test('approved native artboard exports preserve every original RGB pixel', async () => {
  for (const [scene,width] of [['desktop',1536],['mobile',853]]) {
    const master=sharp(new URL(`source-assets/v35-who-we-are/${scene}-master.png`,here).pathname);
    const output=sharp(new URL(`public/images/pardus-who-${scene}-${width}.webp`,here).pathname);
    assert.deepEqual(await output.removeAlpha().raw().toBuffer(),await master.removeAlpha().raw().toBuffer(),scene);
  }
});

test('who we are follows the hero and has an accessible heading and genuine discover link', () => {
  assert.ok(section);
  assert.ok(html.indexOf('id="who-we-are"')>html.indexOf('id="hero-title"'));
  assert.ok(html.indexOf('id="who-we-are"')<html.indexOf('id="destinations"'));
  assert.match(section, /aria-labelledby="who-title"/);
  assert.match(section, /<h2 id="who-title">A world of places\./);
  assert.match(section, /We are Pardus Luxury Escapes\./);
  assert.match(section, /We arrange flights, stays, safaris and private experiences across Africa and around the world\./);
  assert.match(section, /class="who-reference-action" href="\/paradise\/about\.html"/);
  assert.match(section, /Discover Pardus/);
  assert.equal((html.match(/<h1\b/g)||[]).length,1);
});

test('separate approved mobile and desktop art is lazy-loaded with reserved dimensions', () => {
  assert.match(section, /<source[^>]*max-width: 999px[^>]*pardus-who-mobile-480\.webp[^>]*width="853" height="1844"/);
  assert.match(section, /<img[^>]*pardus-who-desktop-1536\.webp[^>]*width="1536" height="1024"[^>]*alt=""[^>]*loading="lazy"/);
  assert.match(section, /class="who-reference-picture" aria-hidden="true"/);
});
