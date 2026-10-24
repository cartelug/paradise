import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { destinations } from '../src/data/destinations.ts';
import { journeys } from '../src/data/journeys.ts';
import { journal } from '../src/data/journal.ts';
import { dubaiDiscoveries, dubaiExperiencePhotos } from '../src/data/dubai-gallery.ts';
import { v31Photography } from '../src/data/v31-photography.ts';

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
  const names = new Set([...destinations, ...journeys, ...journal, ...dubaiDiscoveries, ...dubaiExperiencePhotos].map(item => item.image));
  for (const name of names) {
    for (const width of [640, 1280, 1920]) {
      for (const format of ['avif', 'webp']) await access(new URL(`../public/images/${name}-${width}.${format}`, import.meta.url));
    }
  }
});

test('prepared generated scenes retain truthful illustration labels and source provenance', async () => {
  const credits = JSON.parse(await readFile(new URL('../source-assets/v31-photography/credits.json', import.meta.url), 'utf8'));
  for (const prepared of v31Photography) {
    const source = credits.photos.find(photo => photo.slot === prepared.slot);
    assert.ok(source, `Missing source record for ${prepared.slot}`);
    await access(new URL(`../source-assets/v31-photography/${source.file}`, import.meta.url));
    assert.equal(prepared.alt, source.alt.trim());
    if (/ai-generated/i.test(prepared.source)) {
      assert.match(prepared.alt, /illustrative/i, `${prepared.slot} must identify the scene as illustrative`);
      assert.ok(source.nativeWidth && source.nativeHeight, `${prepared.slot} must retain its native dimensions`);
      assert.ok(source.promptFile, `${prepared.slot} must retain its generation prompt`);
    }
  }
});

test('art-directed scenes have separate responsive desktop and mobile art', async () => {
  const scenes = {
    'v20-horizon': { desktop: [960, 1586], mobile: [480, 960] },
    'section-3-sandbank': { desktop: [960, 1280, 1672], mobile: [480, 720, 941] },
  };
  for (const [scene, variants] of Object.entries(scenes)) {
    for (const [variant, widths] of Object.entries(variants)) {
      for (const width of widths) {
        for (const format of ['avif', 'webp']) await access(new URL(`../public/images/${scene}-${variant}-${width}.${format}`, import.meta.url));
      }
    }
  }
});

test('production typography is local and does not call Fontshare', async () => {
  for (const file of ['Inter-Latin-Variable.woff2', 'Inter-Latin-Italic-Variable.woff2', 'Inter-OFL.txt', 'PlayfairDisplay-Latin-Variable.woff2', 'PlayfairDisplay-Latin-Italic-Variable.woff2', 'PlayfairDisplay-OFL.txt']) {
    await access(new URL(`../public/fonts/${file}`, import.meta.url));
  }
  const layout = await readFile(new URL('../src/layouts/Layout.astro', import.meta.url), 'utf8');
  assert.equal(layout.includes('api.fontshare.com'), false);
});
