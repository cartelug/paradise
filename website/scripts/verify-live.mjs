// Read-only HTTP verification of the actual own-domain release, not just successful FTP login.
import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';
import { legacyRoutes } from '../src/data/routes.mjs';
const origin = process.env.PARDUS_VERIFY_ORIGIN || 'https://pardusescapes.com';
const expected = process.env.GITHUB_SHA || process.env.PARDUS_REVISION;
const results = [];
const get = async path => {
  const response = await fetch(origin + path, { redirect: 'manual', signal: AbortSignal.timeout(30000), headers: { 'Cache-Control': 'no-cache' } });
  return { response, body: await response.text() };
};
async function parallel(items, task) {
  const queue = [...items];
  await Promise.all(Array.from({length: 4}, async () => { while (queue.length) await task(queue.shift()); }));
}
const marker = await get('/release.json?verify=' + encodeURIComponent(expected || Date.now()));
assert.equal(marker.response.status, 200, 'release marker');
const release = JSON.parse(marker.body);
assert.equal(release.version, 46);
if (expected) assert.equal(release.revision, expected, 'live site must match the pushed source revision');
await parallel(Object.entries(legacyRoutes), async ([alias, route]) => {
  const path = '/' + route;
  const page = await get(path);
  assert.equal(page.response.status, 200, path);
  assert.ok(page.body.includes('data-pardus-version="46"'), path + ' is the new release');
  assert.ok(page.body.includes('data-pardus-intro'), path + ' opening');
  assert.ok(page.body.includes(`rel="canonical" href="${origin}${path}"`), path + ' canonical');
  const old = await get('/' + alias + '?source=legacy-check');
  assert.equal(old.response.status, 301, alias + ' permanent redirect');
  assert.equal(old.response.headers.get('location'), `${origin}${path}?source=legacy-check`, alias + ' direct target and query');
  results.push({ path, status: page.response.status, alias, aliasStatus: old.response.status });
});
for (const path of ['/pardus-release-missing-route/', '/pardus-release-missing-page.html', '/images/pardus-release-missing.webp']) {
  const result = await get(path); assert.equal(result.response.status, 404, 'real error status: ' + path);
}
for (const path of ['/about', '/about/index.html']) {
  const result = await get(path); assert.equal(result.response.status, 301, path); assert.equal(result.response.headers.get('location'), origin + '/about/');
}
const sitemap = await get('/sitemap-0.xml');
assert.equal(sitemap.response.status, 200); assert.ok(!sitemap.body.includes('.html<'));
const home = await get('/');
const assets = [...home.body.matchAll(/(?:src|href)="(\/(?:static|fonts|brand)\/[^"?#]+)"/g)].map(m => m[1]);
await parallel([...new Set(assets)], async path => { const result = await get(path); assert.equal(result.response.status, 200, 'live asset ' + path); });
const report = { version: 46, revision: release.revision, verifiedAt: new Date().toISOString(), origin, pages: results.sort((a,b) => a.path.localeCompare(b.path)), errorStatuses: '404', assets: new Set(assets).size };
await writeFile(process.env.PARDUS_LIVE_REPORT || 'live-verification.json', JSON.stringify(report, null, 2));
console.log(`Live release ${release.revision}: ${results.length} canonical pages, ${results.length} direct permanent legacy redirects, real 404s and ${new Set(assets).size} assets verified.`);
