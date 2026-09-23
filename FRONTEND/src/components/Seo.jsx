import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  SITE_NAME, DEFAULT_OG_IMAGE, DEFAULT_OG_IMAGE_WIDTH, DEFAULT_OG_IMAGE_HEIGHT,
  DEFAULT_OG_IMAGE_ALT, absoluteUrl, buildTitle, clampDescription,
} from '../lib/seo';

/**
 * The static head block the HTML shell ships with, captured at import time.
 *
 * index.html carries a full set of defaults between `seo:start` and `seo:end`
 * markers, and prerender-meta.mjs rewrites that block per route, so a scraper
 * that runs no JavaScript still gets real metadata. React then hoists the tags
 * below into the same <head> without replacing anything, which left every page
 * serving two <title> elements, two canonicals and two descriptions.
 *
 * Where the two agree that is merely invalid HTML. Where they disagree it is
 * not: a product added through the admin has no prerendered file, so Vercel
 * rewrites it to the shell and the baked canonical points at the home page
 * while React names the product.
 *
 * The nodes are collected now, while the document still holds only the shell's
 * own head, rather than inside the effect. React hoists its <title> into the
 * middle of that marked range, so anything resolving the range later removes
 * React's replacement along with the default and leaves the page with no title
 * at all.
 */
const SHELL_META = (() => {
  if (typeof document === 'undefined') return [];
  const nodes = [...document.head.childNodes];
  const marker = (name) => (n) => n.nodeType === Node.COMMENT_NODE && n.nodeValue.trim() === name;
  const start = nodes.findIndex(marker('seo:start'));
  const end = nodes.findIndex(marker('seo:end'));
  return start === -1 || end <= start ? [] : nodes.slice(start, end + 1);
})();

/**
 * Drop those defaults once React's own tags are in the document - in an effect,
 * after the commit that hoists them, so the head is never briefly bare.
 */
function useStripShellMeta() {
  useEffect(() => {
    for (const node of SHELL_META) node.remove();
  }, []);
}

/**
 * Per-route metadata. React 19 hoists <title>, <meta> and <link> rendered
 * anywhere in the tree into <head>, so no helmet library is needed.
 *
 * Note this only reaches crawlers that execute JavaScript. Google does;
 * WhatsApp, LinkedIn and Slack link previews do not - they read the static
 * HTML. `npm run build` therefore bakes the same tags into a per-route
 * index.html (scripts/prerender-meta.mjs) so those scrapers get them too.
 *
 * @param {string}  title       Page title, without the site-name suffix.
 * @param {string}  description Meta description; clamped to ~158 chars.
 * @param {string}  image       OG image path, absolute or site-relative.
 * @param {boolean} noindex     Keep the page out of the index entirely.
 * @param {string}  canonical   Override the canonical path (default: current).
 * @param {object|object[]} schema  JSON-LD to embed.
 */
export default function Seo({
  title,
  description,
  image = DEFAULT_OG_IMAGE,
  noindex = false,
  canonical,
  type = 'website',
  schema,
}) {
  const { pathname } = useLocation();
  useStripShellMeta();
  const url = absoluteUrl(canonical || pathname);
  const fullTitle = buildTitle(title);
  const desc = description ? clampDescription(description) : undefined;
  const ogImage = absoluteUrl(image);
  // Dimensions are only true of the shared card. A product page passes its own
  // photograph, and stating the wrong size is worse than stating none.
  const isDefaultImage = image === DEFAULT_OG_IMAGE;
  const imageAlt = isDefaultImage ? DEFAULT_OG_IMAGE_ALT : title || DEFAULT_OG_IMAGE_ALT;
  const blocks = schema ? (Array.isArray(schema) ? schema : [schema]).filter(Boolean) : [];

  return (
    <>
      <title>{fullTitle}</title>
      {desc && <meta name="description" content={desc} />}

      {/* A noindex page still needs a canonical omitted, not pointed elsewhere. */}
      {noindex
        ? <meta name="robots" content="noindex, nofollow" />
        : <link rel="canonical" href={url} />}

      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      {desc && <meta property="og:description" content={desc} />}
      <meta property="og:url" content={url} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:alt" content={imageAlt} />
      {isDefaultImage && <meta property="og:image:width" content={String(DEFAULT_OG_IMAGE_WIDTH)} />}
      {isDefaultImage && <meta property="og:image:height" content={String(DEFAULT_OG_IMAGE_HEIGHT)} />}
      <meta property="og:locale" content="en_IN" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      {desc && <meta name="twitter:description" content={desc} />}
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:image:alt" content={imageAlt} />

      {blocks.map((block, i) => (
        <script
          key={`${block['@type'] || 'schema'}-${i}`}
          type="application/ld+json"
          // Angle brackets in JSON-LD can otherwise close the script element early.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(block).replace(/</g, '\\u003c') }}
        />
      ))}
    </>
  );
}
