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
  SITE_NAME, DEFAULT_OG_IMAGE, DEFAULT_OG_IMAGE_WIDTH, DEFAULT_OG_IMAGE_HEIGHT,
  DEFAULT_OG_IMAGE_ALT, absoluteUrl, buildTitle, clampDescription,
  productSchema, breadcrumbSchema, organizationSchema, websiteSchema, articleSchema,
  faqSchema, serviceSchema, imageGallerySchema, articleListSchema,
} from '../src/lib/seo.js';
import { PAGE_META } from '../src/lib/pageMeta.js';
import { DENTAL_CHAIRS, OTHER_EQUIPMENT, SERVICES_LIST } from '../src/data/products.js';
import { GALLERY_ITEMS } from '../src/data/gallery.js';
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
  const isDefaultImage = image === DEFAULT_OG_IMAGE;
  const imgAlt = esc(isDefaultImage ? DEFAULT_OG_IMAGE_ALT : title || DEFAULT_OG_IMAGE_ALT);
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
    `    <meta property="og:image:alt" content="${imgAlt}" />`,
    ...(isDefaultImage
      ? [`    <meta property="og:image:width" content="${DEFAULT_OG_IMAGE_WIDTH}" />`,
         `    <meta property="og:image:height" content="${DEFAULT_OG_IMAGE_HEIGHT}" />`]
      : []),
    `    <meta property="og:locale" content="en_IN" />`,
    ``,
    `    <meta name="twitter:card" content="summary_large_image" />`,
    `    <meta name="twitter:title" content="${fullTitle}" />`,
    `    <meta name="twitter:description" content="${desc}" />`,
    `    <meta name="twitter:image" content="${img}" />`,
    `    <meta name="twitter:image:alt" content="${imgAlt}" />`,
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

/**
 * Schema a route emits beyond its breadcrumb.
 *
 * The runtime <Seo> already renders these, but only for crawlers that execute
 * JavaScript. Everything that reads the served HTML - every link preview, and
 * any crawler on its first non-rendering pass - saw a breadcrumb and nothing
 * else. Anything listed here is built from bundled data, so the static copy
 * says exactly what the runtime copy says.
 */
const EXTRA_SCHEMA = {
  '/services': () => [serviceSchema(SERVICES_LIST)],
  '/gallery': () => [imageGallerySchema(GALLERY_ITEMS, {
    name: 'Care Dent clinic installations',
    path: '/gallery',
  })],
  '/guides': () => [articleListSchema(ARTICLES)],
};

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
            ...(EXTRA_SCHEMA[path]?.() ?? []),
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

/**
 * A 404 document for hosts that can serve one.
 *
 * A SPA answers every unknown URL with the index shell and HTTP 200, so a
 * mistyped or retired link looks to Google like a real page whose content
 * happens to say "not found" - a soft 404. Those get crawled repeatedly and
 * can be indexed. Netlify and most static hosts serve `404.html` with a real
 * 404 status automatically; the header below keeps it out of the index either
 * way, so the file is useful even where the status stays 200.
 */
function write404() {
  const head = headFor({
    path: '/404',
    title: 'Page Not Found',
    description: 'That page has moved or never existed. Browse the Care Dent catalogue instead.',
  })
    // A 404 must not name a canonical - that asserts the URL is the preferred
    // version of a real page. noindex,follow takes its place: keep it out of
    // the index, still crawl the links out of it.
    .replace(/^.*<link rel="canonical".*$/m, '    <meta name="robots" content="noindex, follow" />');
  writeFileSync(join(DIST, '404.html'), shell.replace(BLOCK, head));
}

let written = 0;
for (const route of routes) {
  const html = shell.replace(BLOCK, headFor(route));
  // '/' is dist/index.html itself; everything else gets its own directory.
  const target = route.path === '/' ? SHELL : join(DIST, route.path, 'index.html');
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, html);
  written += 1;
}

write404();

console.log(`[prerender] metadata baked into ${written} route(s) + 404.html under dist/`);
