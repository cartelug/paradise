import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';

// Bundle the production data module so its Astro-style relative imports resolve.
const bundled = await build({
  entryPoints: [fileURLToPath(new URL('../src/data/offers.ts', import.meta.url))],
  bundle: true, write: false, format: 'esm', platform: 'node', logLevel: 'silent',
});
const { services, serviceGroups } = await import(`data:text/javascript;base64,${Buffer.from(bundled.outputFiles[0].text).toString('base64')}`);

// The V31 leopard hero and the "What should we arrange?" picker.
const site = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const repo = resolve(site, '..');
const read = file => readFile(resolve(site, file), 'utf8');
const exists = async file => { try { await access(file); return true; } catch { return false; } };

test('the hero artwork exists on disk in every size, as WebP and AVIF', async () => {
  for (const name of ['pardus-hero-desktop-1536', 'pardus-hero-desktop-960', 'pardus-hero-phone-1024', 'pardus-hero-phone-640']) {
    for (const ext of ['webp', 'avif']) assert.equal(await exists(resolve(site, 'public/images', `${name}.${ext}`)), true, `${name}.${ext} is missing`);
    assert.equal(await exists(resolve(site, 'source-assets/v31-hero', `${name}.webp`)), true, `${name}.webp is missing from source-assets/v31-hero`);
  }
  for (const name of ['pardus-thumb-maldives.webp', 'pardus-thumb-seychelles.webp', 'pardus-thumb-dubai.webp']) assert.equal(await exists(resolve(site, 'public/images', name)), true, name);
  const artwork = await read('source-assets/v31-hero/ARTWORK.md');
  assert.match(artwork, /AI-generated/, 'ARTWORK.md must record that the hero is AI-generated');
});

test('the hero is one art-directed picture: portrait art on phones and portrait screens, landscape art otherwise', async () => {
  const markup = await read('src/components/Hero.astro');
  assert.match(markup, /const stacked = '\(max-width: 760px\), \(max-aspect-ratio: 11\/10\)'/);
  assert.equal((markup.match(/<picture/g) || []).length, 1, 'the hero must be a single <picture>');
  assert.match(markup, /fetchpriority="high"/);
  assert.match(markup, /sizes="100vw" width="1536" height="1024"/);
  assert.ok(markup.includes('A resting leopard in left profile, with tiny travel scenes woven into its coat above a blue-hour lagoon.'));
  for (const hook of ['data-hero-life', 'data-leopard-box', 'data-hero-spots', 'data-hero-copy', 'data-hero-rail', 'hero-life.ts']) assert.ok(markup.includes(hook), `Hero.astro lost "${hook}"`);
  const index = await read('src/pages/index.astro');
  assert.match(index, /rel="preload"[^>]*pardus-hero-phone-640\.avif/);
  assert.match(index, /rel="preload"[^>]*pardus-hero-desktop-1536\.avif/);
  assert.match(index, /image="images\/pardus-hero-desktop-1536\.webp"/, 'og:image must be the 1536 desktop artwork');
  // The stage keeps the artwork's native shape, so the head, ears, whiskers and paws are never cropped.
  const css = await read('src/styles/hero.css');
  assert.match(css, /\.hero-stage \{[^}]*aspect-ratio: 3 \/ 2/);
  assert.match(css, /\.hero-art \{[^}]*aspect-ratio: 2 \/ 3/);
});

test('the leopard outline covers the head, paws, jet and flight lines on both artworks', async () => {
  const markup = await read('src/components/Hero.astro');
  for (const part of ['jet', 'flight', 'head', 'chest', 'paw', 'paws', 'back']) assert.match(markup, new RegExp(`part: '${part}', keep: (true|false), d: \\[`), `outline part ${part} is missing`);
  for (const part of ['jet', 'flight', 'head', 'paw', 'paws']) assert.match(markup, new RegExp(`part: '${part}', keep: true`), `${part} must be protected from pins`);
});

// The owner found the earlier leopard unsettling for some clients (15 October 2026): glowing eyes, a head that followed the
// pointer, finger or tilted phone, a flare and a buzz when touched. It must stay warm and regal, never watching the visitor.
test('the hero leopard is calm: one slow breath of scale, no glow, no following the visitor, no reaction to a touch', async () => {
  const markup = await read('src/components/Hero.astro');
  assert.doesNotMatch(markup, /hl-glow|hl-eyes|hl-leopard|hl-motes|<canvas/, 'the hero is one still artwork with no extra layers');
  const script = await read('src/scripts/hero-life.ts');
  for (const forbidden of ['pointermove', 'pointerdown', 'touchmove', 'touchstart', 'deviceorientation', 'vibrate', 'startle', 'glint', 'scrollY', 'requestAnimationFrame']) {
    assert.ok(!script.includes(forbidden), `hero-life.ts must not use "${forbidden}": the leopard never reacts to the visitor`);
  }
  for (const behaviour of ['prefers-reduced-motion', 'motion-paused', 'visibilitychange']) assert.ok(script.includes(behaviour), `hero-life.ts lost "${behaviour}"`);
  const css = await read('src/styles/hero.css');
  assert.doesNotMatch(css, /hl-glow|hl-ignite|--spot|--push|--gx|--hero-shift/, 'hero.css must not carry glow, pointer, scroll or sway rules');
  assert.match(css, /@keyframes hero-breathe \{ from \{ transform: scale\(1\); \} to \{ transform: scale\(1\.03\); \} \}/, 'the only motion is a 1.00 to 1.03 scale');
  assert.match(css, /animation: hero-breathe 20s ease-in-out infinite alternate/);
  const motion = await read('src/styles/motion.css');
  assert.match(motion, /html\.motion-paused[^{]*\.hero-picture img/, 'Pause scene must stop the breath');
  assert.match(motion, /prefers-reduced-motion: reduce[\s\S]*\.hero-picture img \{ animation: none/, 'reduced motion must show the still picture');
  const ui = await read('src/scripts/ui.ts');
  assert.doesNotMatch(ui, /hero\.style\.setProperty/, 'the hero must not move with the scroll');
});

test('the phone dock shows all three destinations and prices at once, with no hidden swipe', async () => {
  const css = await read('src/styles/hero.css');
  assert.match(css, /\.hero-offers \{ display: grid; grid-template-columns: repeat\(3, minmax\(0, 1fr\)\)/, 'the dock must be a three-column grid on phones');
  assert.doesNotMatch(css, /scroll-snap-type/, 'the dock must not be a swipe carousel');
  const markup = await read('src/components/Hero.astro');
  assert.doesNotMatch(markup, /hero-dots|hero-rail-foot/);
});

test('the service picker offers every service as a tap target and is a plain GET form', async () => {
  const markup = await read('src/components/ServicePicker.astro');
  assert.match(markup, /method="get"/);
  assert.match(markup, /journey\.html/);
  assert.match(markup, /type="checkbox" name="services"/);
  // Every one of the 13 services is reachable through the groups the picker renders.
  const grouped = serviceGroups.flatMap(group => group.items);
  assert.equal(grouped.length, 13);
  assert.deepEqual([...grouped].sort(), [...services].sort());
});

test('the exported homepage ships the picker, the leopard hero and the floating button', async () => {
  const html = await readFile(resolve(repo, 'index.html'), 'utf8');
  assert.equal((html.match(/<input type="checkbox" name="services"/g) || []).length, 13, 'the homepage must carry 13 service checkboxes');
  const escaped = value => value.replace(/&/g, '&amp;');
  for (const service of services) assert.ok(html.includes(`value="${escaped(service)}"`), `missing service ${service}`);
  assert.match(html, /<form[^>]*data-picker[^>]*action="[^"]*journey\.html"/);
  for (const hook of ['data-hero-life', 'data-leopard-box', 'data-sticky-cta']) assert.ok(html.includes(hook), `index.html lost ${hook}`);
  assert.ok(html.includes('pardus-hero-desktop-1536') && html.includes('pardus-hero-phone-640'), 'index.html does not use the V31 hero artwork');
});

test('the enquiry form turns ?services= into the start of the note', async () => {
  const script = await read('src/scripts/enquiry.ts');
  assert.match(script, /getAll\('services'\)/);
  assert.match(script, /I would like Pardus to arrange/);
});

test('buttons share one system: a round arrow on every trailing arrow, press and focus states', async () => {
  const css = await read('src/styles/base.css');
  assert.match(css, /\.btn > :is\(\.icon-arrow-right, \.icon-arrow-up-right, \.icon-arrow-down\)/);
  assert.match(css, /\.btn:active/);
  assert.match(css, /\.btn:focus-visible/);
  assert.match(css, /min-height: 54px/);
});

test('the hero pins place themselves', async () => {
  const script = await read('src/scripts/hero-life.ts');
  for (const behaviour of ['layoutSpots', "dataset.off = 'true'", 'is-measuring', "dataset.spots = 'ready'"]) assert.ok(script.includes(behaviour), `hero-life.ts lost "${behaviour}"`);
  const markup = await read('src/components/Hero.astro');
  assert.match(markup, /key: 'maldives'[\s\S]*key: 'dubai'[\s\S]*key: 'yacht'/, 'Maldives must keep first claim on space');
  assert.doesNotMatch(markup, /hero-services/, 'the first screen stays uncluttered: the services are listed lower down, in "What we arrange"');
  const html = await readFile(resolve(repo, 'index.html'), 'utf8');
  assert.equal((html.match(/class="spot"/g) || []).length, 3, 'the homepage must carry three pins');
});

