import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { canonicalRoutes, pageFile } from '../src/data/routes.mjs';
const repo = new URL('../../', import.meta.url);
const links = markup => [...markup.matchAll(/<a\b[^>]*href="([^"]+)"/g)].map(match => match[1]);
const strip = markup => markup.replace(/<[^>]*>/g, '').trim();

test('every canonical page gives desktop and phone menus the same primary links and destination shortcuts', async () => {
  for (const route of canonicalRoutes) {
    const html = await readFile(new URL(pageFile(route), repo), 'utf8');
    const nav = name => html.match(new RegExp('<nav class="' + name + '"[^>]*>([\\s\\S]*?)</nav>'))?.[1] || '';
    assert.deepEqual(links(nav('desktop-nav')), links(nav('menu-nav')), route);
    const desktopLabels = [...nav('desktop-nav').matchAll(/<a\b[^>]*>([\s\S]*?)<\/a>/g)].map(m => strip(m[1]));
    const phoneLabels = [...nav('menu-nav').matchAll(/<strong>(.*?)<\/strong>/g)].map(m => m[1]);
    assert.deepEqual(desktopLabels, phoneLabels, route);
    const desktop = html.match(/<div class="desktop-destinations-grid">([\s\S]*?)<\/div>/)?.[1] || '';
    assert.deepEqual(links(desktop), links(nav('menu-destinations')), route);
    assert.equal(links(desktop).length, 6, route);
  }
});

test('the homepage keeps one ordered set of sections and no device-switched destination photography', async () => {
  const html = await readFile(new URL('index.html', repo), 'utf8');
  const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/)?.[1] || '';
  const ids = [...main.matchAll(/<h[12]\b[^>]*id="([^"]+)"/g)].map(m => m[1]);
  assert.deepEqual(ids, ['hero-title', 'who-title', 'featured-title', 'ws-bespoke-title', 'cruise-title', 'arrange-title', 'more-title', 'journeys-title', 'why-title', 'booking-title', 'desk-title', 'enquire-title']);
  const cards = [...html.matchAll(/<article class="ws-card"[\s\S]*?<\/article>/g)].map(m => m[0]);
  assert.equal(cards.length, 3);
  for (const card of cards) assert.doesNotMatch(card, /<source[^>]+media=/);
});
