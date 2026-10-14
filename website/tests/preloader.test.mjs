import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

// HARD RULE (site owner, 14 October 2026): the Pardus preloader is permanent.
// These checks fail the build if a release removes or disables it. See CLAUDE.md.
const site = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const repo = resolve(site, '..');
const read = file => readFile(resolve(site, file), 'utf8');
const exists = async file => { try { await access(file); return true; } catch { return false; } };

test('the preloader source files exist', async () => {
  for (const file of ['src/components/CinematicIntro.astro', 'src/styles/preloader.css', 'src/scripts/preloader.ts']) {
    assert.equal(await exists(resolve(site, file)), true, `${file} must exist: the preloader is permanent (CLAUDE.md)`);
  }
});

test('the preloader markup keeps its full V25 sequence and its safety controls', async () => {
  const markup = await read('src/components/CinematicIntro.astro');
  for (const hook of ['data-pardus-intro', 'data-skip-intro', 'intro-curtain-left', 'intro-curtain-right', 'intro-trace', 'intro-aircraft', 'intro-world', 'intro-progress']) {
    assert.ok(markup.includes(hook), `CinematicIntro.astro lost "${hook}"`);
  }
  assert.match(markup, /Skip introduction/);
  assert.match(markup, /Beautifully arranged/);
});

test('the layout renders the preloader whenever a page asks for it and the homepage asks for it', async () => {
  const layout = await read('src/layouts/Layout.astro');
  assert.match(layout, /import CinematicIntro/);
  assert.match(layout, /\{intro && <CinematicIntro/);
  assert.match(layout, /preloader\.css/);
  assert.match(layout, /preloader\.ts/);
  const home = await read('src/pages/index.astro');
  assert.match(home, /<Layout[^>]*\bintro\b/, 'src/pages/index.astro must pass the intro prop to Layout');
});

test('the preloader script keeps its failsafe, skip and once-per-tab behaviour', async () => {
  const script = await read('src/scripts/preloader.ts');
  assert.match(script, /pardus-intro-v30/);
  assert.match(script, /Escape/);
  assert.match(script, /finishIntro/);
  assert.match(script, /deadline/);
});

test('the guard rule is recorded for future sessions', async () => {
  const rules = await readFile(resolve(repo, 'CLAUDE.md'), 'utf8');
  assert.match(rules, /preloader is permanent/i);
  assert.match(rules, /never remove/i);
});

test('every exported page that should open with the preloader ships it', async () => {
  // Built output is checked when present: the repository root after export, and dist after a build.
  const candidates = [resolve(repo, 'index.html'), resolve(site, 'dist/index.html')];
  let checked = 0;
  for (const file of candidates) {
    if (!(await exists(file))) continue;
    const html = await readFile(file, 'utf8');
    checked++;
    assert.ok(html.includes('data-pardus-intro'), `${file} is missing the preloader markup`);
    assert.ok(html.includes('data-skip-intro'), `${file} is missing the Skip introduction control`);
    assert.ok(html.includes('pardus-intro-v30'), `${file} is missing the preloader bootstrap`);
  }
  assert.ok(checked > 0, 'no built index.html was found to verify');
});
