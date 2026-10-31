import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

// V42, 31 October 2026: the owner supplied five portrait photographs that dissolve into one another behind the phone hero,
// about three seconds each. These checks keep the masters, exports, markup, outlines and motion rules honest.
const site = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const repo = resolve(site, '..');
const read = file => readFile(resolve(site, file), 'utf8');
const exists = async file => { try { await access(file); return true; } catch { return false; } };
const meta = JSON.parse(await read('src/data/mobile-hero-rotation.json'));
const html = await readFile(resolve(repo, 'index.html'), 'utf8');
const hero = html.match(/<section class="hero hero--atlas"[\s\S]*?<\/section>/)?.[0] ?? '';
const slideMarkup = hero.match(/<div class="hero-slide"[\s\S]*?<\/picture>(?:<span class="leopard-box"[^>]*><\/span>)*<\/div>/g) ?? [];

test('five owner-supplied portrait masters have undistorted WebP and AVIF exports, never enlarged', async () => {
  assert.equal(meta.count, 5);
  for (let n = 1; n <= meta.count; n++) {
    const master = await sharp(resolve(site, 'source-assets/v42-mobile-hero-rotation', `hero-${n}.webp`)).metadata();
    assert.equal(master.width, meta.width);
    assert.equal(master.height, meta.height);
    assert.ok(master.height / master.width > 1.7, 'a portrait, not a crop of the desktop picture');
    for (const width of meta.widths) {
      assert.ok(width <= master.width, 'exports are never enlarged');
      for (const extension of ['webp', 'avif']) {
        const file = resolve(site, 'public/images', `${meta.prefix}-${n}-${width}.${extension}`);
        assert.ok(await exists(file), file);
        const image = await sharp(file).metadata();
        assert.equal(image.width, width);
        assert.ok(Math.abs(image.height - width * master.height / master.width) <= 1);
      }
    }
  }
});

test('the exported hero holds the five photographs in the owner’s order, the first current and the rest quiet', () => {
  assert.equal(slideMarkup.length, 5);
  assert.match(hero, /data-hero-rotator data-hold="3000" data-fade="1400"/);
  slideMarkup.forEach((slide, index) => {
    assert.match(slide, new RegExp(`${meta.prefix}-${index + 1}-${meta.widths.at(-1)}\\.webp`));
    assert.match(slide, new RegExp(`data-state="${index === 0 ? 'current' : 'idle'}"`));
    if (index === 0) {
      assert.doesNotMatch(slide, /aria-hidden="true"[^>]*data-hero-slide|data-hero-slide[^>]*aria-hidden="true"/);
      assert.match(slide, /fetchpriority="high"/);
    } else {
      assert.match(slide, /aria-hidden="true"/);
      assert.match(slide, /loading="lazy"/);
    }
    assert.match(slide, /<source media="\(min-width: 768px\)" srcset="data:image\/gif/, 'wide screens never download phone photographs');
    assert.match(slide, /An illustrative travel composite\./);
    assert.doesNotMatch(slide, /alt=""/);
  });
  // Phones never download the wide artwork either.
  assert.match(hero, /<source media="\(max-width: 767px\)" srcset="data:image\/gif/);
  assert.match(hero, /class="hero-pause"[^>]*data-scene-motion/);
});

test('every leopard outline sits below the copy and inside the picture', async () => {
  const markup = await read('src/components/Hero.astro');
  const outlines = [...markup.matchAll(/outline: \[((?:\{ part: '(?:tail|body|head|paws)', m: \[[\d., ]+\] \},? ?)+)\]/g)];
  assert.equal(outlines.length, 3, 'photographs 1, 4 and 5 hold a leopard; 2 and 3 do not');
  for (const [, list] of outlines) {
    const boxes = [...list.matchAll(/part: '(\w+)', m: \[([\d., ]+)\]/g)].map(([, part, numbers]) => ({ part, box: numbers.split(',').map(Number) }));
    assert.deepEqual(boxes.map(item => item.part).sort(), ['body', 'head', 'paws', 'tail']);
    for (const { box: [l, t, r, b] } of boxes) {
      assert.ok(l >= 0 && t >= 0 && r <= 100 && b <= 100 && r > l && b > t);
      // The copy covers the picture down to 44% (margin-top: -78vw of a 177.7vw picture); an animal never starts there.
      assert.ok(t >= 50, `animal region starts at ${t}%`);
    }
  }
  const css = await read('src/styles/hero.css');
  assert.match(css, /\.hero-art \{ aspect-ratio: var\(--hero-portrait-ratio\); margin-top: -78vw; \}/);
  assert.ok(78 / (100 * meta.height / meta.width) < 0.45, 'the copy overlaps less than 45% of the portrait');
  // Three of the five exported slides carry measured boxes.
  assert.equal(slideMarkup.filter(slide => slide.includes('data-leopard-box')).length, 3);
});

test('the rotation script is time-driven, gentle and stoppable', async () => {
  const script = await read('src/scripts/hero-rotation.ts');
  assert.match(script, /prefers-reduced-motion: reduce/);
  assert.match(script, /max-width: 767px/);
  assert.match(script, /motion-paused/);
  assert.match(script, /pardus:motion/);
  assert.match(script, /visibilitychange/);
  assert.match(script, /IntersectionObserver/);
  assert.match(script, /is-ready/);
  assert.match(script, /image\.decode\(\)/, 'a photograph is decoded before it fades in');
  assert.match(script, /aria-hidden/);
  const code = script.replace(/^\s*\/\/.*$/gm, '');
  assert.doesNotMatch(code, /pointer|touch|mouse|deviceorientation|scroll|vibrate/i, 'nothing may react to the visitor');
  const css = await read('src/styles/hero.css');
  assert.match(css, /\.hero-slide\[data-state='entering'\][^}]*animation: hero-slide-in/);
  assert.match(css, /\.hero-rotator \{[^}]*isolation: isolate/, 'slides stay beneath the copy');
  assert.doesNotMatch(css, /animation:[^;}]*infinite/);
  assert.match(css, /prefers-reduced-motion: reduce\) \{\s*\.hero-pause \{ display: none; \}/);
});
