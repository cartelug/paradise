import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { legacyRoutes, canonicalRoutes, pageFile } from '../src/data/routes.mjs';

export async function finishRoutes(dir, base, site) {
  const root = fileURLToPath(dir);
  const prefix = base.replace(/\/$/, '') + '/';
  const escape = s => s.replace(/[&<>"']/g, c => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[c]));
  for (const [legacy, target] of Object.entries(legacyRoutes)) {
    if (legacy === 'index.html') continue;
    const canonical = new URL(prefix + target, site).href;
    // The existing complete branded page is the no-script fallback; canonical + noindex prevent duplicate indexing.
    let html = await readFile(resolve(root, pageFile(target)), 'utf8');
    const move = `(()=>{const to=new URL(${JSON.stringify(canonical)});to.search=location.search;to.hash=location.hash;location.replace(to.href)})();`;
    html = html.replace('<head>', '<head><meta name="robots" content="noindex,follow"><meta http-equiv="refresh" content="0;url=' + escape(canonical) + '"><script>' + move + '</script>');
    await writeFile(resolve(root, legacy), html);
  }
  // The production server uses real 301s; Pages keeps compatible HTML entry points.
  const htaccess = resolve(root, '.htaccess');
  let rules = await readFile(htaccess, 'utf8');
  const lines = ['  # BEGIN PARDUS CANONICAL ROUTES — generated from routes.mjs',
    '  # Legacy aliases precede any existing-file bypass. Queries are retained.',
    '  RewriteCond %{REQUEST_METHOD} ^(?:GET|HEAD)$'];
  // One alternation condition belongs to each rule; HTTP_HOST canonicalization happens directly for legacy entries.
  for (const [legacy, target] of Object.entries(legacyRoutes)) {
    lines.push('  RewriteCond %{REQUEST_METHOD} ^(?:GET|HEAD)$',
      String.raw`  RewriteCond %{THE_REQUEST} \s/+${legacy.replace('.', '\\.')}[?\s] [NC]`,
      `  RewriteRule ^${legacy.replace('.', '\\.')}$ https://pardusescapes.com/${target} [R=301,L,NE]`);
  }
  // Remove the unused leading condition, keeping each rule self-contained.
  lines.splice(2, 1);
  for (const target of canonicalRoutes.filter(Boolean)) {
    const pattern = target.replace(/\/$/, '');
    lines.push(String.raw`  RewriteCond %{THE_REQUEST} \s/+${pattern}/index\.html[?\s] [NC]`,
      `  RewriteRule ^${pattern}/index\\.html$ https://pardusescapes.com/${target} [R=301,L,NE]`,
      `  RewriteRule ^${pattern}$ https://pardusescapes.com/${target} [R=301,L,NE]`);
  }
  lines.push('  # END PARDUS CANONICAL ROUTES');
  rules = rules.replace('  # www.pardusescapes.com', lines.join('\n') + '\n  # www.pardusescapes.com');
  await writeFile(htaccess, rules);
  await writeFile(resolve(root, 'route-manifest.json'), JSON.stringify({ version: 46, base: prefix, routes: legacyRoutes }, null, 2));
  await writeFile(resolve(root, 'release.json'), JSON.stringify({ version: 46, revision: process.env.GITHUB_SHA || process.env.PARDUS_REVISION || 'local', routes: canonicalRoutes.length }));
}
