import { cp, readdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { basename, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { pageFiles } from './page-files.mjs';

const project = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const output = resolve(project, 'dist');
const repository = resolve(project, '..');
// This export is intentionally available only from the checked-in website/ source.
const gitEntry = await stat(resolve(repository, '.git'));
const gitRoot = execFileSync('git', ['rev-parse', '--show-toplevel'], { cwd: repository, encoding: 'utf8' }).trim();
if (basename(project) !== 'website' || !(gitEntry.isDirectory() || gitEntry.isFile()) || resolve(gitRoot).toLowerCase() !== repository.toLowerCase()) {
  throw new Error('Run this script from the website source in the GitHub checkout.');
}
const files = await readdir(output);
if (!files.includes('index.html')) throw new Error('Run the GitHub Pages build first.');
// Never publish the pardusescapes.com build (npm run build:domain) as the GitHub Pages copy: its links start at / not /paradise/.
const robots = await readFile(resolve(output, 'robots.txt'), 'utf8').catch(() => '');
if (!robots.includes('/paradise/sitemap-index.xml')) throw new Error('website/dist is not a GitHub Pages build. Run PARDUS_BASE=/paradise/ npm run build first.');
// Remove only known generated output. This prevents stale HTML and hashed assets from
// surviving a deployment while preserving the source, documentation and git metadata.
for (const directory of ['brand', 'fonts', 'images', 'static']) {
  await rm(resolve(repository, directory), { recursive: true, force: true });
}
for (const entry of await readdir(repository, { withFileTypes: true })) {
  if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'website') {
    const index = await readFile(resolve(repository, entry.name, 'index.html'), 'utf8').catch(() => '');
    if (index.includes('data-pardus-version=')) await rm(resolve(repository, entry.name), { recursive: true, force: true });
  }
  if (!entry.isFile()) continue;
  if (/\.(?:html|xml)$/.test(entry.name) || ['robots.txt', 'opening.js', 'app.js', 'styles.css'].includes(entry.name)) {
    await rm(resolve(repository, entry.name), { force: true });
  }
}
for (const file of files) await cp(resolve(output, file), resolve(repository, file), { recursive: true });
// GitHub Pages cannot run Apache redirects. Keep old bookmarks working there too;
// Namecheap uses the real 301 redirects in .htaccess and does not need these stubs.
for (const page of await pageFiles(output)) {
  if (!page.endsWith('/index.html')) continue;
  const slug = page.slice(0, -'/index.html'.length);
  const target = `/paradise/${slug}/`;
  const canonical = `https://cartelug.github.io${target}`;
  await writeFile(resolve(repository, `${slug}.html`), `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="pardus-legacy-redirect" content="true"><title>Page moved — Pardus</title><link rel="canonical" href="${canonical}"><script>location.replace(${JSON.stringify(target)}+location.search+location.hash)</script><meta http-equiv="refresh" content="0;url=${target}"></head><body><p>This page has moved to <a href="${target}">${target}</a>.</p></body></html>\n`);
}
await writeFile(resolve(repository, '.nojekyll'), '');
console.log(`Exported ${files.length} entries to the repository root. Existing unrelated files are preserved.`);
