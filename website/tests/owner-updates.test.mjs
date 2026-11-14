import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import sharp from 'sharp';
import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';
import { brand } from '../src/data/brand.ts';
import { site } from '../src/data/site.ts';
import { enquiryText } from '../src/scripts/enquiry-message.ts';
import { briefText, cleanBrief } from '../src/scripts/brief.ts';
import { ownerPhotographs } from '../src/data/owner-photographs.ts';

const root = new URL('../', import.meta.url);
const read = file => readFile(new URL(file, root), 'utf8');
const expected = JSON.parse(await read('tests/fixtures/owner-approved-copy.json'));
const home = await read('../index.html');
const about = await read('../about.html');
const normalise = text => text.replace(/&#39;|&#x27;|&apos;/g, "'").replace(/[‘’]/g, "'").replace(/&amp;|&#x26;/g, '&').replace(/\s+/g, ' ').trim();
const visibleText = markup => normalise(markup.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, '').replace(/<[^>]+>/g, ' '));
const bundled = await build({ entryPoints: [fileURLToPath(new URL('src/data/offers.ts', root))], bundle: true, write: false, format: 'esm', platform: 'node', logLevel: 'silent' });
const { offers, cruiseTypes, defineOffer, displayPrice, promotionPrice, destinationOrder } = await import(`data:text/javascript;base64,${Buffer.from(bundled.outputFiles[0].text).toString('base64')}`);

test('the About page presents the seven approved sections in exactly the requested order', () => {
  assert.deepEqual([...about.matchAll(/data-about-section="([^"]+)"/g)].map(match => match[1]), ['story', 'founder', 'vision-mission', 'values', 'brand-promise', 'what-we-do', 'begin-your-journey']);
  for (const heading of ['The Story Behind the Name', 'The Vision Behind PARDUS', 'Our Vision & Mission', 'Our Five Core Values', 'Brand Promise', 'What We Do', 'Begin Your Journey']) assert.ok(visibleText(about).includes(heading), heading);
});

test('story, founder, vision, mission and values match the independently supplied copy word for word', () => {
  for (const paragraph of [...expected.story, ...expected.founder, expected.vision, expected.mission, ...expected.values.flat()]) assert.ok(visibleText(about).includes(normalise(paragraph)), paragraph);
  assert.deepEqual([brand.storyIntro, ...brand.story['first-person']].map(normalise), expected.story.map(normalise));
  assert.equal(site.about.storyVoice, 'first-person');
  assert.equal(site.about.showFounder, true);
  assert.equal(site.founder.name, 'Saidah Namusoke');
});

test('the alternate story voice uses only the supplied third-person wording', () => {
  const approved = [
    'The founder wanted a name that was distinctive, memorable and carried a deeper meaning beyond just being a business name. The leopard represents the identity envisioned for the company: bold yet graceful, independent yet purposeful, and always exceptional.',
    'Just as the leopard moves through different landscapes with confidence and effortless elegance, PARDUS represents a travel brand that opens doors to extraordinary destinations and experiences.',
    'PARDUS is more than a name. It represents a philosophy of travelling differently, experiencing the world beautifully and appreciating the finer details of every journey.',
  ];
  assert.deepEqual(brand.story['third-person'], approved);
});

test('the About page keeps the three collections, seven services and previous booking/difference content', () => {
  for (const text of [...brand.promise, brand.philosophy, ...brand.collections.flatMap(item => [item.name, item.text]), ...brand.services, 'Premium does not mean inaccessible.', 'Every Journey Has a Story. Let Us Curate Yours.', 'One adviser, one conversation.', 'Every proposal is quoted in UGX', 'Clear before you book']) assert.ok(visibleText(about).includes(normalise(text)), text);
  assert.equal((about.match(/<li class="step"/g) || []).length, 4);
  assert.match(about, /id="how-booking-works"/);
  assert.equal((home.match(/Saidah Namusoke is the visionary founder/g) || []).length, 0, 'the long biography belongs on About');
});

test('the founder photograph is conditional, never a generated face or placeholder, and hiding the founder hides schema too', async () => {
  const source = await read('src/pages/about.astro');
  assert.match(source, /site\.about\.showFounder && <section/);
  assert.match(source, /portrait && <img[^>]*data-founder-portrait/);
  assert.doesNotMatch(source, /placeholder|avatar|generated_images/);
  assert.match(await read('src/layouts/Layout.astro'), /site\.about\.showFounder \? \{ founder:/);
  if (site.founder.portrait === null) assert.doesNotMatch(about, /data-founder-portrait/);
  else assert.match(about, /data-founder-portrait/);
});

test('the V44 hero is genuinely transparent, padded, not enlarged and leaves V37 available as history', async () => {
  const art = JSON.parse(await read('src/data/illustrated-home-artwork.json')).lettering['hero-lettering'];
  assert.equal(art.prefix, 'pardus-v44');
  assert.match(art.source, /v44-hero-lettering/);
  const master = new URL('source-assets/v44-hero-lettering/hero-lettering-master.png', root);
  const original = await sharp(master.pathname).metadata();
  const stats = await sharp(master.pathname).stats();
  assert.equal(original.hasAlpha, true); assert.equal(stats.channels[3].min, 0); assert.equal(stats.channels[3].max, 255);
  for (const width of art.widths) {
    assert.ok(width <= original.width);
    const image = sharp(new URL(`public/images/pardus-v44-hero-lettering-${width}.webp`, root).pathname);
    const meta = await image.metadata();
    assert.equal(meta.width, width);
    for (const edge of [{ left: 0, top: 0, width, height: 1 }, { left: 0, top: meta.height - 1, width, height: 1 }, { left: 0, top: 0, width: 1, height: meta.height }, { left: width - 1, top: 0, width: 1, height: meta.height }]) {
      const alpha = await image.clone().extract(edge).extractChannel('alpha').raw().toBuffer();
      assert.ok(alpha.every(value => value === 0), `lettering touches a ${width}px edge`);
    }
  }
  await access(new URL('source-assets/v37-hd-lettering/hero-lettering-master.png', root));
  assert.match(home, /rel="preload"[^>]*pardus-v44-hero-lettering/);
  assert.match(home, /class="hero-personal">Personally curated\.<\/strong>/);
  assert.doesNotMatch(home.match(/<h1[^>]*id="hero-title"[\s\S]*?<\/h1>/)[0], /pardus-v37-hero-lettering/);
});

test('Who We Are uses at least a 16px role, comfortable leading and a solid navy ground', async () => {
  const type = await read('src/styles/type.css');
  assert.match(type, /--fs-who-body: clamp\(1rem,/);
  assert.match(type, /\.window-seat \.ws-description, \.window-seat \.ws-about \{[^}]*font-size: var\(--fs-who-body\)[^}]*line-height: var\(--lh-body\)/);
  assert.match(await read('src/styles/window-seat.css'), /--ws-navy: #05162a/);
  assert.match(home, /class="ws-difference"[^>]*><span>About Pardus/);
});

test('the six priority destinations lead the data, listing, form options and sitemap', async () => {
  const expectedSlugs = ['zanzibar', 'seychelles', 'maldives', 'dubai', 'maasai-mara', 'uganda-gorillas'];
  assert.deepEqual(destinationOrder.slice(0, 6), expectedSlugs);
  assert.deepEqual(offers.slice(0, 6).map(offer => offer.slug), expectedSlugs);
  const windows = [...home.matchAll(/class="ws-window" href="[^"]*destinations\/([a-z-]+)\/"/g)].map(match => match[1]);
  const more = home.slice(home.indexOf('id="more-title"'));
  const next = [...more.matchAll(/class="frame" data-reveal href="[^"]*destinations\/([a-z-]+)\/"/g)].map(match => match[1]);
  assert.deepEqual([...windows, ...next].slice(0, 6), expectedSlugs, 'homepage destination order');
  const listing = await read('../destinations.html');
  const links = [...listing.matchAll(/class="card-media frame" href="[^\"]*destinations\/([a-z-]+)\/"/g)].map(match => match[1]);
  assert.deepEqual(links.slice(0, 6), expectedSlugs);
  const sitemap = await read('../sitemap-0.xml');
  for (const slug of [...expectedSlugs, 'europe', 'africa']) assert.ok(sitemap.includes(`destinations/${slug}/`), slug);
});

test('new package defaults fail closed even when a numeric price is accidentally supplied', () => {
  const input = { slug: 'test', label: 'Test', nights: '4-night escape', experience: 'Test', highlights: [], inclusions: [], fromUSD: 999, priceBasis: 'per person' };
  const offer = defineOffer(input);
  assert.equal(offer.priceApproved, false);
  assert.equal(displayPrice(offer).amount, 'Request a quote');
  assert.equal(displayPrice({ fromUSD: 999 }).hasStartingPrice, false);
  for (const slug of ['maasai-mara', 'uganda-gorillas']) {
    const item = offers.find(offer => offer.slug === slug);
    assert.equal(item.fromUSD, null);
    assert.equal(item.priceApproved, false);
  }
});

test('every offer models dates, duration, departure, occupancy, currency, taxes, components and restrictions', () => {
  for (const offer of [...offers, ...cruiseTypes]) {
    for (const field of ['duration', 'travelDates', 'departureCity', 'occupancyBasis', 'currency', 'taxesFees', 'components', 'inclusions', 'exclusions', 'restrictions', 'priceApproved']) assert.ok(Object.hasOwn(offer, field), `${offer.slug}: ${field}`);
    assert.deepEqual(Object.keys(offer.components).sort(), ['activities', 'flights', 'meals', 'transfers']);
    assert.ok(offer.restrictions.length > 0);
  }
});

test('previous prices require approval, a genuine higher Pardus price and an active valid promotion window', () => {
  const base = { ...offers[0], priceApproved: true, fromUSD: 1000, previousPardusPrice: { amount: 1200, currency: 'USD', verified: true }, promotionWindow: { startsOn: '2026-11-01', endsOn: '2026-11-30' } };
  assert.equal(promotionPrice(base, '2026-11-12').amount, 'USD 1,200');
  for (const change of [
    { priceApproved: false }, { promotionWindow: undefined }, { previousPardusPrice: undefined },
    { previousPardusPrice: { amount: 1200, currency: 'USD', verified: false } },
    { previousPardusPrice: { amount: 900, currency: 'USD', verified: true } },
    { previousPardusPrice: { amount: 1200, currency: 'UGX', verified: true } },
    { promotionWindow: { startsOn: '2026-11-30', endsOn: '2026-11-01' } },
    { promotionWindow: { startsOn: '2026-02-30', endsOn: '2026-11-30' } },
  ]) assert.equal(promotionPrice({ ...base, ...change }, '2026-11-12'), null);
  assert.equal(promotionPrice(base, '2026-10-31'), null);
  assert.equal(promotionPrice(base, '2026-12-01'), null);
});

test('the exact fare notice is reused in Terms, enquiry, planner, saved emails and both brief delivery states', async () => {
  assert.equal(site.fareNotice, expected.fareNotice);
  for (const route of ['terms.html', 'journey.html', 'planner.html']) {
    const page = await read(`../${route}`);
    const notice = page.match(/<aside class="fare-notice"[\s\S]*?<\/aside>/)?.[0];
    assert.ok(notice, route);
    assert.equal(visibleText(notice), normalise(expected.fareNotice));
  }
  const data = new FormData(); data.set('name', 'QA Traveller'); data.set('destination', 'Uganda gorillas');
  assert.ok(enquiryText(data).endsWith(expected.fareNotice));
  for (const sent of [false, true]) assert.ok(briefText(cleanBrief(data), sent).endsWith(expected.fareNotice + '\n'));
  assert.match(await read('src/components/PackageDetails.astro'), /offer\.components\.flights === 'included' && <FareNotice compact/);
  assert.match(await read('src/components/FareNotice.astro'), /Airfares may change until the ticket is issued\./);
});

test('new destination photos have verified sources, hashes, licence links and visible credits', async () => {
  assert.equal(ownerPhotographs.length, 2);
  for (const photo of ownerPhotographs) {
    const bytes = await readFile(new URL(`source-assets/v44-destinations/${photo.file}`, root));
    assert.equal(createHash('sha256').update(bytes).digest('hex'), photo.sha256);
    const page = await read(`../destination-${photo.asset.replace('-v44', '')}.html`);
    assert.ok(page.includes(photo.photographer)); assert.ok(page.includes(photo.licenseUrl));
    for (const width of photo.widths) for (const ext of ['webp', 'avif']) await access(new URL(`public/images/${photo.asset}-${width}.${ext}`, root));
  }
});
