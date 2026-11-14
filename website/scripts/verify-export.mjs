import { readdir, readFile, stat } from 'node:fs/promises';
import { dirname, extname, resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { legacyRoutes, canonicalRoutes, pageFile } from '../src/data/routes.mjs';
const project = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const repository = resolve(project, '..');
const base = process.env.PARDUS_BASE || '/paradise/';
const target = base === '/' ? resolve(project, 'dist') : repository;
const origin = base === '/' ? 'https://pardusescapes.com' : 'https://cartelug.github.io';
const prefix = base.replace(/\/$/, '') + '/';
export async function publicFiles(directory, top = true) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (top && (entry.name.startsWith('.') || ['website', 'node_modules'].includes(entry.name))) continue;
    const file = resolve(directory, entry.name);
    if (entry.isDirectory()) files.push(...await publicFiles(file, false)); else if (entry.isFile()) files.push(file);
  }
  return files;
}
const files = await publicFiles(target);
const textFiles = files.filter(file => ['.html', '.css', '.js', '.xml'].includes(extname(file)));
const missing = new Set();
for (const file of textFiles) {
  const source = await readFile(file, 'utf8');
  if (source.includes('api.fontshare.com') || source.includes('Montserrat-VariableFont_wght.ttf')) throw new Error('Retired font dependency: ' + relative(target, file));
  // Resolve emitted HTML/CSS references, not arbitrary string literals in bundled application code.
  if (extname(file) === '.js') continue;
  const expressions = [...source.matchAll(/(?:href|src|action|poster)="([^"<>]+)"|url\(["']?([^"')]+)["']?\)/g)].map(match => match[1] || match[2]);
  for (const set of source.matchAll(/(?:srcset|imagesrcset)="([^"]+)"/g)) expressions.push(...set[1].split(/,\s*/).map(item => item.split(/\s+/)[0]));
  for (const raw of expressions) {
    if (!raw.startsWith(prefix) || raw.startsWith('//')) continue;
    const path = decodeURIComponent(raw.split(/[?#]/)[0].slice(prefix.length));
    const resolved = resolve(target, path.endsWith('/') || !path ? path + 'index.html' : path);
    if (!resolved.startsWith(target + '/') && resolved !== target) throw new Error('Escaping reference: ' + raw);
    try { if (!(await stat(resolved)).isFile()) missing.add(raw); } catch { missing.add(raw); }
  }
}
if (missing.size) throw new Error('Unresolved exported references:\n' + [...missing].join('\n'));
for (const route of canonicalRoutes) {
  const html = await readFile(resolve(target, pageFile(route)), 'utf8');
  const canonical = `${origin}${prefix}${route}`;
  if (!html.includes(`rel="canonical" href="${canonical}"`) || !html.includes(`property="og:url" content="${canonical}"`)) throw new Error('Wrong canonical metadata: ' + route);
  if (!html.includes('data-pardus-intro') || !html.includes('data-skip-intro')) throw new Error('Missing permanent opening: ' + route);
  if (/\b(?:href|action)="[^"?#]*\.html(?:[?#"])/.test(html)) throw new Error('Legacy HTML address in public navigation: ' + route);
}
for (const [alias, route] of Object.entries(legacyRoutes)) {
  if (alias === 'index.html') continue;
  const html = await readFile(resolve(target, alias), 'utf8');
  if (!html.includes('noindex,follow') || !html.includes('location.replace') || !html.includes(`${origin}${prefix}${route}`)) throw new Error('Broken compatibility entry: ' + alias);
  if (!html.includes('data-pardus-intro')) throw new Error('Missing opening in compatibility page: ' + alias);
}
const sitemap = await readFile(resolve(target, 'sitemap-0.xml'), 'utf8');
const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]);
if (urls.length !== canonicalRoutes.length || urls.some(url => url.endsWith('.html') || !url.startsWith(origin + prefix))) throw new Error('Sitemap does not match canonical route inventory.');
for (const route of canonicalRoutes) if (!urls.includes(`${origin}${prefix}${route}`)) throw new Error('Missing sitemap route: ' + route);
const robots = await readFile(resolve(target, 'robots.txt'), 'utf8');
if (!robots.includes(`${origin}${prefix}sitemap-index.xml`)) throw new Error('Wrong robots sitemap.');
const rules = await readFile(resolve(target, '.htaccess'), 'utf8');
if (!rules.includes('BEGIN PARDUS CANONICAL ROUTES') || !rules.includes('\\s/+index\\.html')) throw new Error('Missing guarded canonical redirect rules.');
await stat(resolve(target, '404.html'));
await stat(resolve(target, 'release.json'));
console.log(`Verified ${canonicalRoutes.length} canonical pages, ${canonicalRoutes.length - 1} legacy entries and the 404 artifact; ${textFiles.length} generated text files; all ${prefix} asset references resolve.`);
