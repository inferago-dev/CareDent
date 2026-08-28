import { useLocation } from 'react-router-dom';
import {
  SITE_NAME, DEFAULT_OG_IMAGE, DEFAULT_OG_IMAGE_WIDTH, DEFAULT_OG_IMAGE_HEIGHT,
  DEFAULT_OG_IMAGE_ALT, absoluteUrl, buildTitle, clampDescription,
} from '../lib/seo';

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
