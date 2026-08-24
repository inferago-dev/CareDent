/**
 * Bakes per-route metadata into static HTML after `vite build`.
 *
 * This is a single-page app: the Seo component sets title, description and
 * JSON-LD at runtime, which Google handles because it renders JavaScript.
 * Link scrapers do not - WhatsApp, LinkedIn, Slack, X and Facebook read the
 * served HTML and stop. Without this step every shared link, whatever the
 * route, previews as the home page.
 *
 * For each route it copies dist/index.html to dist/<route>/index.html with the
 * marked SEO block swapped for that route's tags. Hosts that serve a matching
 * static file before falling back to index.html (Netlify, Vercel, nginx with
 * `try_files $uri $uri/index.html /index.html`) then hand crawlers real
 * metadata, while the app still hydrates and takes over as usual.
 *
 * This is metadata only - it does NOT prerender page content. If you need the
 * body text in the HTML too, that is a move to SSR/SSG.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, join } from 'node:path';

import {
  SITE_NAME, DEFAULT_OG_IMAGE, absoluteUrl, buildTitle, clampDescription,
  productSchema, breadcrumbSchema, organizationSchema, websiteSchema, articleSchema,
  faqSchema,
} from '../src/lib/seo.js';
import { PAGE_META } from '../src/lib/pageMeta.js';
import { DENTAL_CHAIRS, OTHER_EQUIPMENT } from '../src/data/products.js';
import { ARTICLES } from '../src/data/articles.js';
import { faqsFor } from '../src/data/faqs.js';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'dist');
const SHELL = join(DIST, 'index.html');

if (!existsSync(SHELL)) {
  console.error('[prerender] dist/index.html not found - run vite build first');
  process.exit(1);
}

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const ldjson = (blocks) =>
  blocks.filter(Boolean).map((b) =>
    `    <script type="application/ld+json">${JSON.stringify(b).replace(/</g, '\\u003c')}</script>`
  ).join('\n');

function headFor({ path, title, description, image = DEFAULT_OG_IMAGE, type = 'website', schema = [] }) {
  const fullTitle = esc(buildTitle(title));
  const desc = esc(clampDescription(description || ''));
  const url = esc(absoluteUrl(path));
  const img = esc(absoluteUrl(image));
  // Markers are re-emitted so the script stays idempotent - `npm run seo:meta`
  // can be re-run against an already-processed dist without losing its anchor.
  return [
    `<!-- seo:start -->`,
    `    <title>${fullTitle}</title>`,
    `    <meta name="description" content="${desc}" />`,
    `    <link rel="canonical" href="${url}" />`,
    ``,
    `    <meta property="og:site_name" content="${SITE_NAME}" />`,
    `    <meta property="og:type" content="${type}" />`,
    `    <meta property="og:title" content="${fullTitle}" />`,
    `    <meta property="og:description" content="${desc}" />`,
    `    <meta property="og:url" content="${url}" />`,
    `    <meta property="og:image" content="${img}" />`,
    `    <meta property="og:locale" content="en_IN" />`,
    ``,
    `    <meta name="twitter:card" content="summary_large_image" />`,
    `    <meta name="twitter:title" content="${fullTitle}" />`,
    `    <meta name="twitter:description" content="${desc}" />`,
    `    <meta name="twitter:image" content="${img}" />`,
    ...(schema.length ? ['', ldjson(schema)] : []),
    `    <!-- seo:end -->`,
  ].join('\n');
}

const shell = readFileSync(SHELL, 'utf8');
const BLOCK = /<!-- seo:start -->[\s\S]*?<!-- seo:end -->/;
if (!BLOCK.test(shell)) {
  console.error('[prerender] seo:start/seo:end markers missing from index.html');
  process.exit(1);
}

const crumbs = (trail) => breadcrumbSchema(trail);

const routes = [
  ...Object.entries(PAGE_META).map(([path, meta]) => ({
    path,
    ...meta,
    schema:
      path === '/'
        ? [organizationSchema(), websiteSchema()]
        : [
            crumbs([{ name: 'Home', path: '/' }, { name: meta.title.split(' — ')[0], path }]),
            // Pages with a visible FAQ block carry the matching markup.
            ...(faqsFor(path).length ? [faqSchema(faqsFor(path))] : []),
          ],
  })),
  ...[...DENTAL_CHAIRS, ...OTHER_EQUIPMENT].map((p) => {
    const slug = p.slug || p.id;
    const path = `/products/${slug}`;
    const product = {
      ...p, slug,
      heroImage: p.heroImage || p.image,
      images: p.images?.length ? p.images : [p.heroImage || p.image].filter(Boolean),
    };
    return {
      path,
      title: p.name,
      description: p.description || p.tagline,
      image: product.heroImage,
      type: 'product',
      schema: [
        productSchema(product),
        crumbs([
          { name: 'Home', path: '/' },
          { name: 'Products', path: '/products' },
          { name: p.name, path },
        ]),
      ],
    };
  }),
  ...ARTICLES.map((a) => ({
    path: `/guides/${a.slug}`,
    title: a.title,
    description: a.summary,
    type: 'article',
    schema: [
      articleSchema(a),
      crumbs([
        { name: 'Home', path: '/' },
        { name: 'Guides', path: '/guides' },
        { name: a.title, path: `/guides/${a.slug}` },
      ]),
    ],
  })),
];

let written = 0;
for (const route of routes) {
  const html = shell.replace(BLOCK, headFor(route));
  // '/' is dist/index.html itself; everything else gets its own directory.
  const target = route.path === '/' ? SHELL : join(DIST, route.path, 'index.html');
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, html);
  written += 1;
}

console.log(`[prerender] metadata baked into ${written} route(s) under dist/`);
