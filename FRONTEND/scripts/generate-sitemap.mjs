/**
 * Writes public/sitemap.xml from the route table and the bundled catalogue.
 *
 * Product URLs come from src/data/products.js, the same list the site falls
 * back to when the API is unreachable. If a product is added through the admin
 * content manager only, add it there too or it will not be listed here.
 *
 *   npm run sitemap
 */
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

import { SITE_URL } from '../src/lib/seo.js';
import { PAGE_META } from '../src/lib/pageMeta.js';
import { DENTAL_CHAIRS, OTHER_EQUIPMENT } from '../src/data/products.js';

const OUT = resolve(dirname(fileURLToPath(import.meta.url)), '../public/sitemap.xml');
const today = new Date().toISOString().slice(0, 10);

const escape = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&apos;');

const urls = [
  ...Object.entries(PAGE_META).map(([path, meta]) => ({
    loc: `${SITE_URL}${path === '/' ? '/' : path}`,
    priority: meta.priority ?? 0.5,
    changefreq: path === '/' ? 'weekly' : 'monthly',
  })),
  ...[...DENTAL_CHAIRS, ...OTHER_EQUIPMENT].map((p) => ({
    loc: `${SITE_URL}/products/${p.slug || p.id}`,
    priority: 0.7,
    changefreq: 'monthly',
  })),
];

const seen = new Set();
const unique = urls.filter((u) => !seen.has(u.loc) && seen.add(u.loc));

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${unique.map((u) => `  <url>
    <loc>${escape(u.loc)}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority.toFixed(1)}</priority>
  </url>`).join('\n')}
</urlset>
`;

writeFileSync(OUT, xml);
console.log(`[sitemap] ${unique.length} URLs -> public/sitemap.xml (${SITE_URL})`);
