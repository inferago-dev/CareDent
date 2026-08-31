/**
 * The product catalogue as the live API sees it, for build-time use.
 *
 * Products created in the admin content manager never touch this repo: they
 * are not in src/data/products.js and git knows nothing about them. The API is
 * the only source that does. Both generate-sitemap.mjs and prerender-meta.mjs
 * need them, and a second copy of this fetch is how the two scripts end up
 * disagreeing about what is published.
 *
 * Nothing here may fail a build. Every failure path returns an empty list and
 * leaves the caller with the bundled catalogue.
 */
const RAW_API = (process.env.VITE_API_URL || '').replace(/\/+$/, '');

/**
 * Where the API serves uploaded files.
 *
 * Product images come back as relative paths ("/uploads/images/chair-ab12.jpg")
 * and the API is on its own origin, so they resolve against the server root -
 * not the /api base, and emphatically not the site, which would point every
 * og:image at a 404 on www.caredent.net.
 *
 * This mirrors fileUrl() in src/lib/api.js. That module cannot be imported
 * here: it reads import.meta.env, which plain Node has no answer for.
 */
const FILE_ROOT = RAW_API.replace(/\/api$/, '');

const absoluteFile = (path) => {
  if (!path) return '';
  if (/^https?:\/\//.test(path)) return path;
  if (!FILE_ROOT) return '';
  return `${FILE_ROOT}${path.startsWith('/') ? path : `/${path}`}`;
};

const PAGE_LIMIT = 100; // the API caps `limit` here
const MAX_PAGES = 50;   // guard against a bad `meta.pages` looping forever
const TIMEOUT_MS = 15000;

/**
 * Every active product the API knows about, with image paths made absolute.
 *
 * @param {string} label prefix for log lines, so the caller is identifiable.
 * @returns {Promise<object[]>} products, or [] when the API cannot be read.
 */
export async function fetchPublishedProducts(label = 'catalogue') {
  if (!RAW_API) {
    console.log(`[${label}] VITE_API_URL is not set - using the bundled catalogue only`);
    return [];
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  const collected = [];

  try {
    for (let page = 1; page <= MAX_PAGES; page += 1) {
      const res = await fetch(
        `${RAW_API}/products?limit=${PAGE_LIMIT}&page=${page}`,
        { signal: controller.signal, headers: { accept: 'application/json' } }
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const body = await res.json();
      collected.push(...(Array.isArray(body?.data) ? body.data : []));
      if (page >= (body?.meta?.pages || 1)) break;
    }
  } catch (err) {
    const reason = err.name === 'AbortError' ? 'timed out' : err.message;
    console.warn(`[${label}] could not read products from ${RAW_API} (${reason})`);
    console.warn(`[${label}] falling back to the bundled catalogue - admin-only products will be missing`);
    return [];
  } finally {
    clearTimeout(timer);
  }

  return collected
    .filter((p) => p?.slug)
    .map((p) => ({
      ...p,
      heroImage: absoluteFile(p.heroImage),
      images: (p.images || []).map(absoluteFile).filter(Boolean),
    }));
}
