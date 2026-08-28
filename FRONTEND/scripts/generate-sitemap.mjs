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
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

import { SITE_URL } from '../src/lib/seo.js';
import { PAGE_META } from '../src/lib/pageMeta.js';
import { DENTAL_CHAIRS, OTHER_EQUIPMENT } from '../src/data/products.js';
import { ARTICLES } from '../src/data/articles.js';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = resolve(ROOT, 'public/sitemap.xml');
const today = new Date().toISOString().slice(0, 10);

/**
 * Last commit date for a file, as YYYY-MM-DD.
 *
 * `lastmod` used to be today's date for every URL on every build, which told
 * Google the entire site changed each time we deployed. Crawlers discount a
 * sitemap that does that, which costs exactly the crawl priority the field is
 * meant to earn. Git already knows when each page's source last changed, so
 * ask it. Falls back to today outside a repo (a fresh tarball, some CI images).
 */
const dateCache = new Map();
function lastCommitDate(...files) {
  const key = files.join('|');
  if (dateCache.has(key)) return dateCache.get(key);

  let date = today;
  try {
    const out = execFileSync(
      'git',
      ['log', '-1', '--format=%cs', '--', ...files],
      { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }
    ).trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(out)) date = out;
  } catch {
    /* not a git checkout - today is the honest best guess */
  }
  dateCache.set(key, date);
  return date;
}

// A route's freshness is the newest of the copy that describes it and the page
// that renders it.
const META_SOURCE = 'src/lib/pageMeta.js';
const CATALOGUE_SOURCE = 'src/data/products.js';
const ARTICLE_SOURCE = 'src/data/articles.js';

const escape = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&apos;');

// Maps a route to the page component behind it, so editing the page counts as
// changing the URL even when the metadata copy did not move.
const PAGE_SOURCE = {
  '/': 'src/pages/Home.jsx',
  '/about': 'src/pages/About.jsx',
  '/products': 'src/pages/Products.jsx',
  '/services': 'src/pages/Services.jsx',
  '/services/pre-installation': 'src/pages/PreInstallation.jsx',
  '/gallery': 'src/pages/Gallery.jsx',
  '/guides': 'src/pages/Guides.jsx',
  '/dental-clinic-setup': 'src/pages/ClinicSetup.jsx',
  '/dental-chair-service-chennai': 'src/pages/ChennaiService.jsx',
  '/track-order': 'src/pages/TrackOrder.jsx',
  '/contact': 'src/pages/Contact.jsx',
};

const urls = [
  ...Object.entries(PAGE_META).map(([path, meta]) => ({
    loc: `${SITE_URL}${path === '/' ? '/' : path}`,
    priority: meta.priority ?? 0.5,
    changefreq: path === '/' ? 'weekly' : 'monthly',
    lastmod: lastCommitDate(...[META_SOURCE, PAGE_SOURCE[path]].filter(Boolean)),
  })),
  ...[...DENTAL_CHAIRS, ...OTHER_EQUIPMENT].map((p) => ({
    loc: `${SITE_URL}/products/${p.slug || p.id}`,
    priority: 0.7,
    changefreq: 'monthly',
    lastmod: lastCommitDate(CATALOGUE_SOURCE),
  })),
  ...ARTICLES.map((a) => ({
    loc: `${SITE_URL}/guides/${a.slug}`,
    priority: 0.6,
    changefreq: 'yearly',
    // A guide states its own dates; trust those over the file's commit date.
    lastmod: a.updatedAt || a.publishedAt || lastCommitDate(ARTICLE_SOURCE),
  })),
];

const seen = new Set();
const unique = urls.filter((u) => !seen.has(u.loc) && seen.add(u.loc));

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${unique.map((u) => `  <url>
    <loc>${escape(u.loc)}</loc>
    <lastmod>${u.lastmod || today}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority.toFixed(1)}</priority>
  </url>`).join('\n')}
</urlset>
`;

writeFileSync(OUT, xml);
console.log(`[sitemap] ${unique.length} URLs -> public/sitemap.xml (${SITE_URL})`);
