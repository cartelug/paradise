import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile, readdir } from 'node:fs/promises';
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
  // The opening carries the site's one primary tagline (site.tagline: "Extraordinary journeys. Personally curated.").
  assert.match(markup, /Personally curated/);
});

test('the layout renders the preloader on every page, with no switch to turn it off', async () => {
  const layout = await read('src/layouts/Layout.astro');
  assert.match(layout, /import CinematicIntro/);
  assert.match(layout, /<CinematicIntro/);
  assert.doesNotMatch(layout, /\{\s*intro\s*&&/, 'the preloader must not be conditional');
  assert.doesNotMatch(layout, /intro\?:\s*boolean/, 'Layout must not offer an opt-out prop for the preloader');
  assert.match(layout, /preloader\.css/);
  assert.match(layout, /preloader\.ts/);
  assert.match(layout, /intro-quick/);
  assert.match(layout, /intro-full/);
  const pages = (await readdir(resolve(site, 'src/pages'))).filter(file => file.endsWith('.astro'));
  for (const page of pages) {
    const source = await read(`src/pages/${page}`);
    assert.doesNotMatch(source, /<Layout[^>]*\bintro=\{?false/, `${page} must not disable the preloader`);
  }
});

test('the preloader script keeps its failsafe, skip, quick mode and leaving curtains', async () => {
  const script = await read('src/scripts/preloader.ts');
  assert.match(script, /pardus-intro-v30/);
  assert.match(script, /Escape/);
  assert.match(script, /finishIntro/);
  assert.match(script, /deadline/);
  assert.match(script, /intro-quick/);
  assert.match(script, /intro-leaving/);
  assert.match(script, /pageshow/);
});

test('the guard rule is recorded for future sessions', async () => {
  const rules = await readFile(resolve(repo, 'CLAUDE.md'), 'utf8');
  assert.match(rules, /preloader is permanent/i);
  assert.match(rules, /never remove/i);
});

test('every built page ships the preloader', async () => {
  // Built output is checked when present: the repository root after export, and dist after a build.
  let checked = 0;
  for (const directory of [repo, resolve(site, 'dist')]) {
    if (!(await exists(resolve(directory, 'index.html')))) continue;
    const pages = (await readdir(directory)).filter(file => file.endsWith('.html'));
    for (const page of pages) {
      const html = await readFile(resolve(directory, page), 'utf8');
      checked++;
      assert.ok(html.includes('data-pardus-intro'), `${directory}/${page} is missing the preloader markup`);
      assert.ok(html.includes('data-skip-intro'), `${directory}/${page} is missing the Skip introduction control`);
      assert.ok(html.includes('pardus-intro-v30') && html.includes('intro-quick') && html.includes('intro-full'), `${directory}/${page} is missing the preloader bootstrap`);
      assert.ok(html.includes('data-intro-label') || html.includes('intro-label'), `${directory}/${page} is missing the page label`);
    }
  }
  assert.ok(checked > 0, 'no built pages were found to verify');
});
