import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

const base = process.env.PARDUS_BASE || '/';
const site = process.env.PARDUS_SITE || 'https://cartelug.github.io';
export default defineConfig({
  site,
  base,
  output: 'static',
  trailingSlash: 'always',
  build: { format: 'directory', assets: 'static' },
  server: { host: '0.0.0.0', port: 4173 },
  devToolbar: { enabled: false },
  vite: { server: { allowedHosts: ['terminal.local'] } },
  integrations: [sitemap({
    filter: page => !page.includes('/404'),
  })],
});
