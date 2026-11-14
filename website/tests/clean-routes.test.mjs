import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { legacyRoutes, canonicalRoutes, canonicalRoute, pageFile } from '../src/data/routes.mjs';
const repo = fileURLToPath(new URL('../../', import.meta.url));

test('all existing content has one unique final route; assets and unknown aliases are not rewritten', () => {
  assert.equal(canonicalRoutes.length, 34);
  assert.equal(new Set(canonicalRoutes).size, 34);
  assert.equal(canonicalRoute('destinations.html?category=wild#places'), 'destinations/?category=wild#places');
  assert.equal(canonicalRoute('destination-zanzibar.html'), 'destinations/zanzibar/');
  assert.equal(canonicalRoute('journey.html'), 'journey/');
  assert.equal(canonicalRoute('journey-safari-and-shore.html'), 'journeys/safari-and-shore/');
  assert.equal(canonicalRoute('images/story.html.webp'), 'images/story.html.webp');
  assert.equal(canonicalRoute('unknown.html'), 'unknown.html');
  assert.equal(pageFile('destinations/zanzibar/'), 'destinations/zanzibar/index.html');
});

test('every canonical content page has final metadata, useful markup and no legacy navigation', async () => {
  const titles = new Set();
  for (const route of canonicalRoutes) {
    const page = await readFile(resolve(repo, pageFile(route)), 'utf8');
    assert.ok(page.includes(`rel="canonical" href="https://cartelug.github.io/paradise/${route}"`), route);
    assert.ok(page.includes('data-pardus-intro') && page.includes('data-skip-intro'), route);
    assert.equal((page.match(/<h1\b/g) || []).length, 1, route);
    assert.doesNotMatch(page, /(?:href|action)="[^"?#]*\.html(?:[?#"])/, route);
    const title = page.match(/<title>(.*?)<\/title>/)[1];
    assert.ok(!titles.has(title), route); titles.add(title);
    await stat(resolve(repo, pageFile(route)));
  }
});

test('compatibility pages preserve state while production rules use guarded direct 301s', async () => {
  const rules = await readFile(resolve(repo, '.htaccess'), 'utf8');
  for (const [alias, route] of Object.entries(legacyRoutes)) {
    const escaped = alias.replace('.', '\\.');
    assert.ok(rules.includes(`RewriteRule ^${escaped}$ https://pardusescapes.com/${route} [R=301,L,NE]`), alias);
    assert.ok(rules.includes(`THE_REQUEST} \\s/+${escaped}[?\\s]`), alias + ' external request guard');
    if (alias === 'index.html') continue;
    const page = await readFile(resolve(repo, alias), 'utf8');
    assert.ok(page.includes('noindex,follow') && page.includes('to.search=location.search;to.hash=location.hash;location.replace'), alias);
    assert.ok(page.includes('data-pardus-intro'), alias);
  }
  assert.ok(rules.indexOf('BEGIN PARDUS CANONICAL ROUTES') < rules.indexOf('www.pardusescapes.com ->'));
});
