import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { destinations } from '../src/data/destinations.ts';
import { journeys } from '../src/data/journeys.ts';
import { journal } from '../src/data/journal.ts';

const unique = values => new Set(values).size === values.length;

test('published content has unique, URL-safe slugs and complete planning fields', () => {
  for (const collection of [destinations, journeys, journal]) {
    assert.equal(unique(collection.map(item => item.slug)), true);
    collection.forEach(item => assert.match(item.slug, /^[a-z0-9-]+$/));
  }
  destinations.forEach(destination => {
    assert.ok(destination.idealFor.length >= 3, destination.slug);
    assert.ok(destination.routePairs.length >= 3, destination.slug);
    assert.ok(destination.considerations.length >= 3, destination.slug);
    assert.ok(destination.seasonNote.length >= 80, destination.slug);
  });
  journeys.forEach(journey => {
    assert.equal(journey.chapters.length, 3, journey.slug);
    assert.ok(journey.idealFor.length >= 3, journey.slug);
    assert.ok(journey.rhythm.length >= 3, journey.slug);
  });
});

test('every editorial image has responsive AVIF and WebP derivatives', async () => {
  const names = new Set([...destinations, ...journeys, ...journal].map(item => item.image));
  for (const name of names) {
    for (const width of [640, 1280, 1920]) {
      for (const format of ['avif', 'webp']) await access(new URL(`../public/images/${name}-${width}.${format}`, import.meta.url));
    }
  }
});

test('production typography is local and does not call Fontshare', async () => {
  for (const file of ['Satoshi-Light.woff2', 'Satoshi-Regular.woff2', 'Satoshi-Medium.woff2', 'Satoshi-Bold.woff2', 'Montserrat-Variable.woff2']) {
    await access(new URL(`../public/fonts/${file}`, import.meta.url));
  }
  const layout = await readFile(new URL('../src/layouts/Layout.astro', import.meta.url), 'utf8');
  assert.equal(layout.includes('api.fontshare.com'), false);
});

