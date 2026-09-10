import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

const base = process.env.PARDUS_BASE || '/';
export default defineConfig({
  site: 'https://cartelug.github.io',
  base,
  output: 'static',
  trailingSlash: 'never',
  build: { format: 'file', assets: 'static' },
  server: { host: '0.0.0.0', port: 4173 },
  devToolbar: { enabled: false },
  vite: { server: { allowedHosts: ['terminal.local'] } },
  integrations: [sitemap({
    filter: page => !page.includes('/404'),
    // The sitemap integration emits extensionless routes; build.format:'file' actually serves
    // real *.html files (matching every canonical tag and internal link on the site), so restore
    // the real filename here rather than let the sitemap silently disagree with the site itself.
    serialize: item => {
      const url = new URL(item.url);
      if (!url.pathname.endsWith('.html') && !url.pathname.endsWith('/')) url.pathname += '.html';
      return { ...item, url: url.toString() };
    },
  })],
});
