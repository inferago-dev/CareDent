/**
 * Writes public/sitemap.xml from the route table and the bundled catalogue.
 *
 * Product URLs come from src/data/products.js, the same list the site falls
 * back to when the API is unreachable. If a product is added through the admin
 * content manager only, add it there too or it will not be listed here.
 *
 *   npm run sitemap
 */
import { readFileSync, writeFileSync } from 'node:fs';
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

const unescapeXml = (s) =>
  String(s).replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, '&');

/**
 * The dates in the sitemap already committed to the tree.
 *
 * Read before anything is written, so a build that cannot see real history
 * republishes the dates it last published instead of inventing new ones.
 */
const previousLastmod = new Map();
try {
  const entry = /<loc>([^<]+)<\/loc>\s*<lastmod>([^<]+)<\/lastmod>/g;
  for (const [, loc, mod] of readFileSync(OUT, 'utf8').matchAll(entry)) {
    previousLastmod.set(unescapeXml(loc), mod);
  }
} catch {
  /* first run, or no sitemap yet - there is nothing to carry forward */
}

/**
 * Whether git here can answer "when did this file last change?" honestly.
 *
 * Vercel, and most CI, clones shallowly. In a depth-1 clone every file looks
 * as though the tip commit created it, so `git log -1` returns that single
 * date for every path: a well-formed answer that happens to be wrong for all
 * but the files that commit really touched. Validating the date's *format*
 * cannot catch that, which is how every URL ended up stamped with the deploy
 * date - the exact "the whole site changed today" signal this field exists to
 * avoid. So ask git whether its history is complete before trusting it.
 */
const gitDatesAreTrustworthy = (() => {
  try {
    return execFileSync(
      'git', ['rev-parse', '--is-shallow-repository'],
      { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }
    ).trim() === 'false';
  } catch {
    // Not a git checkout, or a git too old to know the flag. Either way we
    // cannot vouch for what `git log` would say, so we do not use it.
    return false;
  }
})();

/**
 * Last commit date for a file as YYYY-MM-DD, or null when git cannot say.
 */
const dateCache = new Map();
function lastCommitDate(...files) {
  if (!gitDatesAreTrustworthy) return null;

  const key = files.join('|');
  if (dateCache.has(key)) return dateCache.get(key);

  let date = null;
  try {
    const out = execFileSync(
      'git',
      ['log', '-1', '--format=%cs', '--', ...files],
      { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }
    ).trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(out)) date = out;
  } catch {
    /* leave it null - the caller falls back to what we published before */
  }
  dateCache.set(key, date);
  return date;
}

/**
 * A URL's lastmod: what git says, else what we last published for that URL,
 * else today. Only a genuinely new URL should ever be dated today.
 */
const carriedOver = new Set();
const datedToday = new Set();
function freshness(loc, gitDate) {
  if (gitDate) return gitDate;
  const published = previousLastmod.get(loc);
  if (published) {
    carriedOver.add(loc);
    return published;
  }
  datedToday.add(loc);
  return today;
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
  ...Object.entries(PAGE_META).map(([path, meta]) => {
    const loc = `${SITE_URL}${path === '/' ? '/' : path}`;
    const sources = [META_SOURCE, PAGE_SOURCE[path]].filter(Boolean);
    return {
      loc,
      priority: meta.priority ?? 0.5,
      changefreq: path === '/' ? 'weekly' : 'monthly',
      lastmod: freshness(loc, lastCommitDate(...sources)),
    };
  }),
  ...[...DENTAL_CHAIRS, ...OTHER_EQUIPMENT].map((p) => {
    const loc = `${SITE_URL}/products/${p.slug || p.id}`;
    return {
      loc,
      priority: 0.7,
      changefreq: 'monthly',
      lastmod: freshness(loc, lastCommitDate(CATALOGUE_SOURCE)),
    };
  }),
  ...ARTICLES.map((a) => {
    const loc = `${SITE_URL}/guides/${a.slug}`;
    return {
      loc,
      priority: 0.6,
      changefreq: 'yearly',
      // A guide states its own dates; trust those over anything inferred.
      lastmod: a.updatedAt || a.publishedAt || freshness(loc, lastCommitDate(ARTICLE_SOURCE)),
    };
  }),
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
if (!gitDatesAreTrustworthy) {
  console.log(
    `[sitemap] no usable git history (shallow clone or no repo) - kept the ` +
    `published lastmod for ${carriedOver.size} URL(s)` +
    (datedToday.size ? `, dated ${datedToday.size} new URL(s) today` : '')
  );
}
