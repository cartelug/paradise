import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { selectTravelUpdates, travelFeedStatus } from '../src/data/travel-updates.ts';

const now = new Date('2026-10-14T12:00:00Z');
const notice = overrides => ({ title: 'Jambojet returns with Nairobi–Entebbe flights',
  summary: 'Read the official notice for the route and travel details.', source: 'Uganda CAA',
  category: 'Aviation update', url: 'https://caa.go.ug/jambojet-returns/', publishedAt: '2026-10-01',
  checkedAt: '2026-10-14', ...overrides });

test('legacy recruitment and non-traveller institution notices cannot reach either renderer', () => {
  const irrelevant = [
    'Principal Engineer, Aerodrome Planning & Development',
    'Senior Civil Engineer, Aerodrome Planning & Development',
    'Civil Engineer, Aerodrome Planning & Development',
    'Manager Marketing And Commercial Services',
    'Senior Flight Operations Inspector',
    'Uganda Air Force College students visit Entebbe International Airport',
    'ICAO Aviation Security Crisis Management workshop',
  ].map((title, index) => notice({ title, url: `https://caa.go.ug/notice-${index}/` }));
  irrelevant.push(notice({ sourceCategories: ['Vacancies'] }));
  irrelevant.push(notice({ url: 'https://caa.go.ug/recruitment/flight-operations/' }));
  assert.deepEqual(selectTravelUpdates([notice(), ...irrelevant], 10, now), [notice()]);
});

test('travel selection rejects bad origins, dates and stale notices before sorting and limiting', () => {
  const bad = [
    notice({ url: 'https://caa.go.ug.evil.example/route/' }),
    notice({ url: 'http://caa.go.ug/route/' }),
    notice({ url: 'https://someone@caa.go.ug/route/' }),
    notice({ url: 'https://caa.go.ug:8080/route/' }),
    notice({ publishedAt: '2026-02-30' }),
    notice({ publishedAt: '2026-10-15' }),
    notice({ checkedAt: '2026-10-15' }),
    notice({ expiresAt: '2026-10-13' }),
    notice({ publishedAt: '2026-06-01' }),
  ];
  assert.deepEqual(selectTravelUpdates(bad, 10, now), []);
  const latest = notice({ url: 'https://caa.go.ug/passenger-notice/', publishedAt: '2026-10-10' });
  assert.deepEqual(selectTravelUpdates([notice(), notice(), latest], 2, now), [latest, notice()]);
});

test('feed status never fabricates a check date and distinguishes an old source check', () => {
  assert.equal(travelFeedStatus(null, now), 'Official travel sources');
  assert.equal(travelFeedStatus('not-a-date', now), 'Official travel sources');
  assert.equal(travelFeedStatus('2026-10-15T12:00:00Z', now), 'Official travel sources');
  assert.equal(travelFeedStatus('2026-10-14T11:00:00Z', now), 'Aviation feed checked 14 Oct 2026');
  assert.equal(travelFeedStatus('2026-10-10T11:00:00Z', now), 'Last aviation feed check 10 Oct 2026');
});

test('the shipped feed contains only eligible traveller notices', async () => {
  const feed = JSON.parse(await readFile(new URL('../public/travel-updates.json', import.meta.url), 'utf8'));
  const atSourceCheck = new Date(feed.updatedAt || now);
  assert.equal(selectTravelUpdates(feed.items, 20, atSourceCheck).length, feed.items.length);
  assert.ok(feed.items.every(item => item.checkedAt));
});
