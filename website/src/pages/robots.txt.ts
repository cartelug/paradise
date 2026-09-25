import type { APIRoute } from 'astro';
import { absolute } from '../data/site';

export const GET: APIRoute = () => new Response(`User-agent: *\nAllow: /\n\nSitemap: ${absolute('sitemap-index.xml')}\n`);
