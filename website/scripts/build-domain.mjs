// Builds the site for its own domain, https://pardusescapes.com, served from the root of public_html on Namecheap cPanel.
// Output goes to website/dist (it replaces any GitHub Pages build there). Do not run export:github after this build:
// the GitHub Pages copy at https://cartelug.github.io/paradise/ needs PARDUS_BASE=/paradise/ (see README.md).
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const project = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const env = { ...process.env, PARDUS_SITE: 'https://pardusescapes.com', PARDUS_BASE: '/' };
const astroPackage = resolve(project, 'node_modules', 'astro');
const { bin } = JSON.parse(readFileSync(resolve(astroPackage, 'package.json'), 'utf8'));
const astro = resolve(astroPackage, typeof bin === 'string' ? bin : bin.astro);
const result = spawnSync(process.execPath, [astro, 'build'], { cwd: project, env, stdio: 'inherit' });
if (result.status !== 0) process.exit(result.status ?? 1);
console.log('Built for https://pardusescapes.com/ in website/dist. Next: PARDUS_BASE=/ npm run verify:export, then npm run package:cpanel.');
