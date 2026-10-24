import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

// The October 2026 website review: one primary tagline, one navigation, a real enquiry, trust, search.
// These read the exported pages at the repository root (run after `npm run build` and `npm run export:github`).
const site = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const repo = resolve(site, '..');
const read = file => readFile(resolve(site, file), 'utf8');
const pages = (await readdir(repo)).filter(file => file.endsWith('.html')).sort();
const html = Object.fromEntries(await Promise.all(pages.map(async page => [page, await readFile(resolve(repo, page), 'utf8')])));
const text = markup => markup.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<style[\s\S]*?<\/style>/g, '').replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ');

test('the five navigation labels are the same on every page, with Plan your escape as the one prominent action', () => {
  const labels = ['Destinations', 'Signature journeys', 'Our difference', 'Corporate travel', 'Journal'];
  for (const [page, markup] of Object.entries(html)) {
    const nav = markup.match(/<nav class="desktop-nav"[^>]*>([\s\S]*?)<\/nav>/);
    assert.ok(nav, `${page} has no main navigation`);
    const found = [...nav[1].matchAll(/<a [^>]*>([^<]+)<\/a>/g)].map(match => match[1]);
    assert.deepEqual(found, labels, `${page} navigation differs`);
    assert.match(markup, /class="btn btn--gold btn--sm header-cta"[^>]*>Plan your escape(?:<svg|<\/a>)/, `${page} lost the header action`);
  }
});

test('one primary tagline is used with the logo: hero, opening, footer, search description and structured data', async () => {
  const { tagline } = { tagline: 'Extraordinary journeys. Personally curated.' };
  const config = await read('src/data/site.ts');
  assert.ok(config.includes(`tagline: '${tagline}'`), 'site.tagline is the primary tagline');
  const home = html['index.html'];
  const headline = home.match(/<h1\b[^>]*id="hero-title"[^>]*>[\s\S]*?<\/h1>/)?.[0];
  assert.ok(headline, 'the homepage has its semantic primary heading');
  assert.equal(text(headline).trim(), tagline, 'decorative lettering retains the exact real heading text');
  assert.match(text(home), /Flights, stays, safaris and private experiences, arranged around you\. From Africa to the world\./);
  assert.ok(home.includes('"slogan":"Extraordinary journeys. Personally curated."'), 'structured data carries the tagline');
  for (const [page, markup] of Object.entries(html)) {
    assert.ok(text(markup).includes(tagline), `${page} (footer or opening) does not carry the primary tagline`);
    assert.doesNotMatch(text(markup), /Luxury travel, beautifully arranged/i, `${page} still carries a retired tagline`);
  }
});

test('the enquiry needs a name and an email, offers phone or WhatsApp, confirms when sent and keeps a saved copy optional', () => {
  for (const page of ['index.html', 'journey.html']) {
    const form = html[page].match(/<form class="form" data-escape-enquiry[\s\S]*?<\/form>/)?.[0];
    assert.ok(form, `${page} has no enquiry form`);
    assert.match(form, /<input id="[^"]*-name" name="name"[^>]*\brequired\b/, `${page}: name must be required`);
    assert.match(form, /<input id="[^"]*-email" name="email" type="email"[^>]*\brequired\b/, `${page}: email must be required`);
    assert.match(form, /<input id="[^"]*-phone" name="phone" type="tel"/, `${page}: phone or WhatsApp field`);
    assert.doesNotMatch(form, /Your name <span>\(optional\)/);
    assert.doesNotMatch(form, /Your email <span>\(optional\)/);
    assert.match(form, /data-enquiry-thanks[^>]*\bhidden\b/, `${page}: a confirmation panel`);
    assert.match(form, /data-download-enquiry/, `${page}: saving a copy stays available`);
  }
});

test('enquiries are delivered by the connected service when one is set, with a clear confirmation, and fall back to email draft', async () => {
  const script = await read('src/scripts/enquiry.ts');
  assert.match(script, /deliverEnquiry\(site\.enquiryEndpoint/);
  assert.match(script, /confirmSent\(\)/);
  assert.match(script, /mailto:/, 'email draft remains the fallback');
  assert.match(script, /Phone or WhatsApp/);
});

test('trust: how booking works, cancellations, contact routes and no invented credentials', async () => {
  const about = html['about.html'];
  assert.equal((about.match(/<li class="step"/g) || []).length, 4, 'four booking steps on Our difference');
  assert.match(text(about), /About Pardus/);
  assert.equal((html['index.html'].match(/<li class="step"/g) || []).length, 4, 'four booking steps on the homepage');
  assert.match(html['index.html'], /id="how-booking-works"/);
  const terms = text(html['terms.html']);
  assert.match(terms, /Cancellations and changes/);
  assert.match(terms, /set by the airlines, hotels, yacht operators and other suppliers/);
  for (const [page, markup] of Object.entries(html)) assert.match(text(markup), /Booking, cancellations & terms/, `${page} footer lacks the booking and cancellation terms link`);
  assert.match(html['contact.html'], /mailto:bookings@pardusescapes\.com/);
  // Credentials, a phone number and WhatsApp appear only when the business has supplied verified values.
  const config = await read('src/data/site.ts');
  const credentials = config.match(/credentials: \[([\s\S]*?)\] as/)?.[1].trim();
  if (!credentials) for (const markup of Object.values(html)) assert.doesNotMatch(markup, /Company details/);
  if (/phone: ''/.test(config)) for (const markup of Object.values(html)) assert.doesNotMatch(markup, /href="tel:/);
});

test('search: every page has its own title and description, and every image declares its alt text (empty only for decoration)', () => {
  const titles = new Map();
  for (const [page, markup] of Object.entries(html)) {
    const title = markup.match(/<title>([^<]+)<\/title>/)?.[1];
    const description = markup.match(/<meta name="description" content="([^"]*)"/)?.[1];
    assert.ok(title && title.length <= 70, `${page} title: ${title}`);
    assert.ok(description && description.length >= 60 && description.length <= 200, `${page} description length ${description?.length}`);
    assert.equal(titles.has(title), false, `${page} repeats the title of ${titles.get(title)}`);
    titles.set(title, page);
    for (const image of markup.match(/<img\b[^>]*>/g) || []) assert.match(image, /\balt(=|\s|>)/, `${page} has an image without alt text: ${image.slice(0, 90)}`);
  }
  assert.match(html['index.html'], /<title>Luxury travel from Uganda and East Africa/);
});

test('the homepage follows the review: a small set of signature journeys and the difference, before the enquiry', () => {
  const markup = html['index.html'];
  const at = needle => markup.indexOf(needle);
  assert.ok(at('id="journeys-title"') > 0, 'signature journeys on the homepage');
  assert.equal((markup.match(/href="[^"]*journey-[a-z-]+\.html"[^>]*aria-label="Explore /g) || []).length, 3, 'three signature journeys');
  assert.ok(at('id="destinations"') < at('id="journeys-title"') && at('id="journeys-title"') < at('id="how-booking-works"') && at('id="how-booking-works"') < at('id="enquire"'));
});
