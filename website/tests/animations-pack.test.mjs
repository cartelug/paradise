import test from 'node:test';
import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

// The animation pack of 1 November 2026 (src/styles/animations.css, src/scripts/animations.ts). It extends the existing motion
// system and must stay gentle: reduced motion switches every new effect off, and nothing animates a price, a fact or a leopard.
const site = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const repo = resolve(site, '..');
const read = file => readFile(resolve(site, file), 'utf8');
const css = await read('src/styles/animations.css');
const script = await read('src/scripts/animations.ts');
const code = text => text.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

test('the pack is loaded by every page, after motion.css and before the type layer', async () => {
  const layout = await read('src/layouts/Layout.astro');
  assert.ok(layout.indexOf("styles/motion.css") < layout.indexOf("styles/animations.css"), 'animations.css must follow motion.css so its reveal styles win');
  assert.ok(layout.indexOf("styles/animations.css") < layout.indexOf("styles/type.css"), 'type.css stays the last stylesheet that matters');
  assert.match(layout, /import '\.\.\/scripts\/animations\.ts'/);
});

test('every new effect is inside prefers-reduced-motion: no-preference or is a print/forced-colours hide', () => {
  const body = code(css);
  // Everything except the tokens, the keyframes and the print rule must sit under the no-preference media query.
  const outside = body
    .replace(/@media \(prefers-reduced-motion: no-preference\) \{(?:[^{}]*\{(?:[^{}]*\{[^{}]*\})*[^{}]*\})*[^{}]*\}/g, '')
    .replace(/@keyframes [\w-]+ \{(?:[^{}]*\{[^{}]*\})*[^{}]*\}/g, '')
    .replace(/@media print, \(forced-colors: active\) \{[^{}]*\{[^{}]*\}\s*\}/g, '')
    .replace(/:root \{[^}]*\}/g, '')
    .trim();
  assert.equal(outside, '', `rules outside the reduced-motion guard: ${outside.slice(0, 160)}`);
  assert.doesNotMatch(body, /infinite/, 'nothing in the pack loops');
});

test('the pack adds no second progress bar: the header already carries the page-progress line', async () => {
  assert.doesNotMatch(css, /progress|animation-timeline|scroll\(/, 'the header page-progress line in chrome.css is the only one');
  assert.match(await read('src/styles/chrome.css'), /\.page-progress/);
});

test('the new reveal styles are used on the homepage and never on a price or a leopard', async () => {
  const html = await readFile(resolve(repo, 'index.html'), 'utf8');
  assert.ok((html.match(/data-reveal="zoom"/g) || []).length >= 4, 'promises and the enquiry card settle in with zoom');
  assert.ok((html.match(/data-reveal="blur"/g) || []).length >= 2, 'two lead sentences clear from a blur');
  for (const tag of html.match(/<[^>]*data-reveal="(?:zoom|blur)"[^>]*>/g) || []) {
    assert.doesNotMatch(tag, /price|leopard|ws-price|offer-price/i, tag);
  }
  assert.doesNotMatch(css + script, /count-?up|counter|toLocaleString|textContent/, 'no figure is ever animated');
});

test('the ripple script reacts only to a press, never to movement, scroll or tilt, and respects reduced motion', () => {
  const body = code(script);
  assert.match(body, /pointerdown/);
  assert.match(body, /prefers-reduced-motion: reduce/);
  assert.doesNotMatch(body, /pointermove|mousemove|touchmove|scroll|deviceorientation|devicemotion|vibrate/i);
  assert.match(body, /\.btn, \.pick/);
  assert.match(body, /remove\(\)/, 'a ripple removes itself');
});

test('the hero drift stays out of reduced motion and the leopards are not animated by it', async () => {
  const hero = await read('src/styles/hero.css');
  const drift = hero.match(/@media \(prefers-reduced-motion: no-preference\) \{[^@]*hero-slide-drift[^@]*\}/)?.[0] ?? '';
  assert.match(drift, /html\.is-ready \.hero-slide\[data-state='current'\]/);
  assert.match(drift, /html\.motion-paused/);
  assert.match(hero, /@keyframes hero-slide-drift \{ from \{ transform: scale\(1\); \} to \{ transform: scale\(1\.045\); \} \}/);
  assert.doesNotMatch(hero, /\.leopard-(?:box|outline)[^{]*\{[^}]*animation/);
});

test('inline text links reach 44 px with padding that a negative margin cancels', async () => {
  const refine = await read('src/styles/refine.css');
  for (const selector of ['.dest-top h3 a', '.travel-update > a', '.form-note a']) {
    const rule = refine.match(new RegExp(selector.replace(/[.>]/g, '\\$&') + ' \\{([^}]*)\\}'))?.[1] ?? '';
    assert.ok(rule, selector);
    assert.match(rule, /padding/);
    assert.match(rule, /margin[^;]*-\d+px/);
  }
});

test('the home logo links carry their visible tagline in their accessible name', async () => {
  const header = await read('src/components/Header.astro');
  assert.doesNotMatch(header, /aria-label="Pardus Luxury Escapes home"/);
  assert.equal((header.match(/aria-label=\{`Pardus Luxury Escapes, \$\{site\.tagline\}\. Home`\}/g) || []).length, 2);
});
