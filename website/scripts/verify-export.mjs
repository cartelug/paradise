import { access, readdir, readFile, stat } from 'node:fs/promises';
import { basename, dirname, extname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const project = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const repository = resolve(project, '..');
const gitEntry = await stat(resolve(repository, '.git')).catch(() => null);
if (basename(project) !== 'website' || !(gitEntry?.isDirectory() || gitEntry?.isFile())) {
  throw new Error('Unexpected export location: run from website/ inside the git checkout.');
}
// Match the base the export was built with (PARDUS_BASE); GitHub Pages uses /paradise/.
const base = process.env.PARDUS_BASE || '/paradise/';
// The GitHub Pages export lives at the repository root. A root build (PARDUS_BASE=/, `npm run build:domain` for
// pardusescapes.com) is checked where it was built, in website/dist, because that is what goes into the cPanel zip.
const dist = resolve(project, 'dist');
const target = base === '/' ? dist : repository;
const escaped = base.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
// A root base needs a stricter pattern so closing tags and protocol-relative URLs are not read as paths.
const reference = base === '/'
  ? /(?<=["'(\s,])\/(?!\/)([A-Za-z0-9_][^\s"'<>),?#]*)/g
  : new RegExp(`(?<=["'(\\s,])${escaped}([^\\s"'<>),?#]*)`, 'g');

async function filesBelow(directory) {
  const found = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const full = resolve(directory, entry.name);
    if (entry.isDirectory()) found.push(...await filesBelow(full));
    else found.push(full);
  }
  return found;
}

const all = await filesBelow(target);
const publicFiles = target === dist ? all : all.filter(file => !file.startsWith(resolve(repository, '.git')) && !file.startsWith(project));
const html = publicFiles.filter(file => extname(file) === '.html');
const generatedPages = (await readdir(resolve(project, 'dist'))).filter(file => file.endsWith('.html')).length;
if (html.length !== generatedPages) throw new Error(`Expected ${generatedPages} generated HTML pages; found ${html.length}.`);

const textFiles = publicFiles.filter(file => ['.html', '.css', '.js', '.xml'].includes(extname(file)));
const missing = new Set();
let combined = '';
for (const file of textFiles) {
  const source = await readFile(file, 'utf8');
  combined += source;
  for (const match of source.matchAll(reference)) {
    const relative = decodeURIComponent(match[1]);
    if (!relative) continue;
    try { await access(resolve(target, relative)); } catch { missing.add(relative); }
  }
}

if (missing.size) throw new Error(`Missing exported references:\n${[...missing].sort().join('\n')}`);
if (combined.includes('api.fontshare.com')) throw new Error('The export still contains a Fontshare dependency.');
if (combined.includes('Montserrat-VariableFont_wght.ttf')) throw new Error('The export still references the retired Montserrat TTF.');
for (const retired of ['app.js', 'styles.css']) {
  try { await access(resolve(target, retired)); throw new Error(`Retired root asset still exists: ${retired}`); } catch (error) {
    if (error instanceof Error && error.message.startsWith('Retired')) throw error;
  }
}

if (target === dist) {
  // The own-domain build must point search engines and sharing at https://pardusescapes.com/, never at GitHub Pages.
  const origin = 'https://pardusescapes.com/';
  const robots = await readFile(resolve(dist, 'robots.txt'), 'utf8');
  if (!robots.includes(`${origin}sitemap-index.xml`)) throw new Error('robots.txt does not point at https://pardusescapes.com/sitemap-index.xml.');
  for (const sitemap of ['sitemap-index.xml', 'sitemap-0.xml']) {
    const xml = await readFile(resolve(dist, sitemap), 'utf8');
    const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]);
    if (!urls.length || urls.some(url => !url.startsWith(origin))) throw new Error(`${sitemap} has URLs outside ${origin}.`);
  }
  for (const file of html) {
    const page = await readFile(file, 'utf8');
    if (page.includes('cartelug.github.io')) throw new Error(`${basename(file)} still mentions cartelug.github.io.`);
    if (basename(file) === '404.html') continue;
    if (!page.match(/<link rel="canonical" href="https:\/\/pardusescapes\.com\//)) throw new Error(`${basename(file)} has no pardusescapes.com canonical URL.`);
    if (!page.match(/<meta property="og:url" content="https:\/\/pardusescapes\.com\//)) throw new Error(`${basename(file)} has no pardusescapes.com og:url.`);
  }
  try { await access(resolve(dist, '.htaccess')); } catch { throw new Error('The domain build is missing .htaccess.'); }
}

console.log(`Verified ${html.length} HTML pages and ${textFiles.length} generated text assets; every ${base} reference resolves.`);
