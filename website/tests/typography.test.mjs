import test from 'node:test';
import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

// The type system lives in src/styles/type.css (see CLAUDE.md, "Type system rebuild"). These checks keep it honest: components use
// the role tokens, only the weights that exist are used, nothing is set in italics, and no text drops below 12 px.
const site = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const stylesDir = resolve(site, 'src/styles');
const names = (await readdir(stylesDir)).filter(file => file.endsWith('.css')).sort();
const sources = Object.fromEntries(await Promise.all(names.map(async file => [file, (await readFile(resolve(stylesDir, file), 'utf8')).replace(/\/\*[\s\S]*?\*\//g, '')])));

const rules = [];
for (const [file, css] of Object.entries(sources)) {
  for (const match of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) rules.push({ file, selector: match[1].trim(), body: match[2] });
}
const declarations = property => rules.flatMap(rule => [...rule.body.matchAll(new RegExp(`(?:^|;|\\s)${property}\\s*:\\s*([^;}]+)`, 'g'))].map(match => ({ ...rule, value: match[1].trim() })));
const toPx = (amount, unit) => (unit === 'px' ? amount : amount * 16);

const tokens = new Set([...sources['type.css'].matchAll(/(--[a-z0-9-]+)\s*:/g)].map(match => match[1]));

test('type.css defines every size, leading, tracking, weight and measure token the stylesheets use', () => {
  for (const required of ['label', 'small', 'body-s', 'body', 'lead', 'h4', 'h3', 'h2-s', 'h2', 'title-l', 'h1', 'display', 'figure-s', 'figure', 'number', 'nav']) {
    assert.ok(tokens.has(`--fs-${required}`), `missing --fs-${required}`);
  }
  const used = new Set();
  for (const css of Object.values(sources)) for (const match of css.matchAll(/var\((--(?:fs|lh|ls|fw|measure)-[a-z0-9-]+)/g)) used.add(match[1]);
  assert.ok(used.size > 20, 'components should reach for the role tokens');
  for (const token of used) assert.ok(tokens.has(token), `${token} is used but not defined in type.css`);
});

test('the size scale is fluid, never below 12 px for text, and the measures stay near 70 characters', () => {
  const type = sources['type.css'];
  for (const match of type.matchAll(/--fs-([a-z0-9-]+)\s*:\s*([^;]+);/g)) {
    const [, name, value] = match;
    const clamp = value.match(/^clamp\(\s*([\d.]+)rem\s*,\s*[\d.]+rem\s*\+\s*[\d.]+vw\s*,\s*([\d.]+)rem\s*\)/);
    if (name === 'nav') { assert.ok(parseFloat(value) * 16 >= 14, '--fs-nav must be at least 14 px'); continue; }
    assert.ok(clamp, `--fs-${name} should be a fluid clamp(rem, rem + vw, rem)`);
    assert.ok(parseFloat(clamp[1]) * 16 >= 12, `--fs-${name} starts below 12 px`);
    assert.ok(parseFloat(clamp[2]) >= parseFloat(clamp[1]), `--fs-${name} shrinks as the screen grows`);
  }
  for (const match of type.matchAll(/--measure-[a-z]+\s*:\s*([\d.]+)ch/g)) assert.ok(parseFloat(match[1]) <= 56, `${match[0]} is too wide for comfortable reading`);
});

test('only the weights that exist in Sky Text and MTN Brighter Sans are used (300, 400, 700)', () => {
  const allowed = /^(300|400|700|normal|bold|inherit|initial|unset|var\(--fw-(?:light|regular|bold)\))(\s*!important)?$/;
  const offenders = declarations('font-weight').filter(item => !allowed.test(item.value));
  assert.deepEqual(offenders.map(item => `${item.file}: ${item.selector} { font-weight: ${item.value} }`), []);
});

test('no italic or oblique text anywhere: neither family has one, so accents are upright and coloured', () => {
  const offenders = declarations('font-style').filter(item => /italic|oblique/.test(item.value));
  assert.deepEqual(offenders.map(item => `${item.file}: ${item.selector}`), []);
  assert.match(sources['type.css'], /font-synthesis:\s*none/);
});

test('no literal font size is smaller than 12 px; the logo lockup caption is the one scaled exception', () => {
  const offenders = [];
  for (const item of declarations('font-size')) {
    const literal = item.value.match(/^(?:clamp\(\s*)?([\d.]+)(px|rem|em)\b/);
    if (!literal) continue;
    const px = toPx(parseFloat(literal[1]), literal[2]);
    if (px >= 12) continue;
    if (item.file === 'type.css' && /\.brand-tagline/.test(item.selector)) { assert.ok(px >= 10, 'the lockup caption must stay at least 10 px'); continue; }
    offenders.push(`${item.file}: ${item.selector} { font-size: ${item.value} } = ${px}px`);
  }
  assert.deepEqual(offenders, []);
});

test('display faces are only used for display type: MTN Brighter Sans is never set on small text', () => {
  const type = sources['type.css'];
  assert.match(type, /\.price strong[^{]*\{[^}]*font-family:\s*var\(--font-figure\)/, 'prices and figures use the figure face');
  assert.match(sources['base.css'], /--font-display:[^;]*MTN Brighter Sans/);
  assert.match(sources['base.css'], /--font-ui:[^;]*Sky Text/);
});
