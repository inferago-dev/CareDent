/**
 * Single source of truth for everything search engines and social scrapers
 * read. Deliberately free of React and of Vite-only syntax so the build
 * scripts (sitemap, per-route head injection) can import it from plain Node.
 */

/**
 * Production origin, no trailing slash. Override per environment with
 * VITE_SITE_URL. Every canonical, sitemap entry and og:image is built from
 * this, so it must match the domain the site is actually served from.
 *
 * This default was `https://caredent.in` while the site was served from
 * www.caredent.net, and caredent.in has never resolved - no A, NS or SOA
 * record. Every page therefore carried a cross-domain canonical to a host
 * that does not exist, which is an instruction to Google to index something
 * else instead. If this is ever repointed, change it here AND clear any
 * VITE_SITE_URL set in the Vercel project, or the two disagree silently.
 */
export const SITE_URL = (
  import.meta.env?.VITE_SITE_URL ||
  globalThis.process?.env?.VITE_SITE_URL ||
  'https://www.caredent.net'
).replace(/\/+$/, '');

export const SITE_NAME = 'Care Dent';
export const SITE_TAGLINE = 'We care for your precious equipments';
/**
 * The share card. Scrapers crop a `summary_large_image` to roughly 1.91:1, so
 * the old portrait logo (507x640) came back cropped through the middle or
 * demoted to a small thumbnail. This is a real 1200x630 card.
 *
 * Declaring the dimensions alongside it lets Facebook and LinkedIn lay the
 * card out before they have fetched the image, instead of dropping it from
 * the first render of a preview.
 */
export const DEFAULT_OG_IMAGE = '/og-card.png';
export const DEFAULT_OG_IMAGE_WIDTH = 1200;
export const DEFAULT_OG_IMAGE_HEIGHT = 630;
export const DEFAULT_OG_IMAGE_ALT =
  'Care Dent - dental equipment supply, installation and service in Chennai';

export const BUSINESS = {
  legalName: 'Care Dent',
  founder: 'Mr. Sivakumar',
  street: 'Roshan Villa, No. 64, 2nd Street, Arumugam Nagar, Mugalivakkam',
  locality: 'Chennai',
  region: 'Tamil Nadu',
  postalCode: '600125',
  country: 'IN',
  phones: ['+919444153599', '+919884418360'],
  email: 'jashvish.siva@gmail.com',
  // Mon-Sat 9:00-19:00, per COMPANY_DETAILS.workingHours
  opens: '09:00',
  closes: '19:00',
  days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  foundingDate: '2023-01',
};

export const absoluteUrl = (path = '/') =>
  /^https?:\/\//.test(path) ? path : `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;

/** Page titles read "<page> | Care Dent"; the home page stands alone. */
export const buildTitle = (title) =>
  !title || title === SITE_NAME ? title || SITE_NAME : `${title} | ${SITE_NAME}`;

/** Descriptions over ~160 chars get truncated in results - cut on a word. */
export const clampDescription = (text = '', max = 158) => {
  const clean = String(text).replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, clean.lastIndexOf(' ', max - 1)).trim()}…`;
};

/* ------------------------------------------------------------------ *
 * JSON-LD builders
 * ------------------------------------------------------------------ */

/**
 * The company itself. Emitted once, on the home page - repeating it on every
 * route gives search engines nothing extra and inflates each document.
 */
export const organizationSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  '@id': `${SITE_URL}/#organization`,
  name: SITE_NAME,
  legalName: BUSINESS.legalName,
  // The mark is written "Care Dent"; almost every search for it is typed as
  // one word. Listing the variants is what lets Google treat them as one
  // entity rather than as unrelated strings.
  alternateName: ['Caredent', 'CareDent', 'Care Dent Chennai'],
  description:
    'Dental equipment supply, installation and service in Chennai - dental chairs, ' +
    'X-ray units, compressors and autoclaves, backed by in-house certified engineers.',
  url: SITE_URL,
  logo: absoluteUrl('/Logo_Badge.png'),
  image: absoluteUrl(DEFAULT_OG_IMAGE),
  slogan: SITE_TAGLINE,
  foundingDate: BUSINESS.foundingDate,
  founder: { '@type': 'Person', name: BUSINESS.founder },
  email: BUSINESS.email,
  telephone: BUSINESS.phones[0],
  address: {
    '@type': 'PostalAddress',
    streetAddress: BUSINESS.street,
    addressLocality: BUSINESS.locality,
    addressRegion: BUSINESS.region,
    postalCode: BUSINESS.postalCode,
    addressCountry: BUSINESS.country,
  },
  contactPoint: BUSINESS.phones.map((phone) => ({
    '@type': 'ContactPoint',
    telephone: phone,
    contactType: 'customer service',
    areaServed: 'IN',
    availableLanguage: ['en', 'ta'],
  })),
  openingHoursSpecification: [{
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: BUSINESS.days,
    opens: BUSINESS.opens,
    closes: BUSINESS.closes,
  }],
  areaServed: { '@type': 'Country', name: 'India' },
});

/** Enables the sitelinks search box when Google chooses to show one. */
export const websiteSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${SITE_URL}/#website`,
  name: SITE_NAME,
  url: SITE_URL,
  publisher: { '@id': `${SITE_URL}/#organization` },
  potentialAction: {
    '@type': 'SearchAction',
    target: { '@type': 'EntryPoint', urlTemplate: `${SITE_URL}/products?q={search_term_string}` },
    'query-input': 'required name=search_term_string',
  },
});

export const breadcrumbSchema = (trail = []) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: trail.map((crumb, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: crumb.name,
    item: absoluteUrl(crumb.path),
  })),
});

/**
 * Product schema.
 *
 * No `offers` and no `aggregateRating`, both on purpose. The catalogue is
 * quote-based, so a price would be invented; and no review has ever been
 * collected, so a rating would be too. Google treats unverifiable review
 * markup as a structured-data violation, and a manual action costs more than
 * the rich result is worth. Add both once there is real data behind them.
 */
export const productSchema = (product) => {
  if (!product) return null;
  const slug = product.slug || product.id;
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${SITE_URL}/products/${slug}#product`,
    name: product.name,
    description: clampDescription(product.description || product.tagline || '', 300),
    sku: slug,
    category: product.category,
    ...(product.series ? { model: product.series } : {}),
    image: (product.images?.length ? product.images : [product.heroImage || product.image])
      .filter(Boolean)
      .map(absoluteUrl),
    brand: { '@type': 'Brand', name: SITE_NAME },
    url: absoluteUrl(`/products/${slug}`),
    ...(product.specifications?.length
      ? {
          additionalProperty: product.specifications.map((spec) => ({
            '@type': 'PropertyValue',
            name: spec.label,
            value: spec.value,
          })),
        }
      : {}),
  };
};

export const serviceSchema = (services = []) => ({
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'Care Dent services',
  itemListElement: services.map((service, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    item: {
      '@type': 'Service',
      name: service.title,
      description: clampDescription(service.description, 300),
      provider: { '@id': `${SITE_URL}/#organization` },
      areaServed: { '@type': 'Country', name: 'India' },
    },
  })),
});

/**
 * FAQ markup. Google can surface these directly in results, so the answers
 * must match what is visible on the page - marking up text the visitor cannot
 * see is a structured-data violation.
 */
export const faqSchema = (faqs = []) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map(({ q, a }) => ({
    '@type': 'Question',
    name: q,
    acceptedAnswer: { '@type': 'Answer', text: a },
  })),
});

/** A blog post or guide. */
export const articleSchema = (article) => ({
  '@context': 'https://schema.org',
  '@type': 'Article',
  '@id': `${SITE_URL}/guides/${article.slug}#article`,
  headline: article.title,
  description: clampDescription(article.summary, 300),
  datePublished: article.publishedAt,
  dateModified: article.updatedAt || article.publishedAt,
  author: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
  publisher: { '@id': `${SITE_URL}/#organization` },
  mainEntityOfPage: absoluteUrl(`/guides/${article.slug}`),
  ...(article.image ? { image: absoluteUrl(article.image) } : {}),
});

/**
 * A gallery page. `ImageObject` entries let Google associate each photograph
 * with its caption and the product it shows, rather than treating the page as
 * an undifferentiated wall of images.
 */
export const imageGallerySchema = (items = [], { name, path }) => ({
  '@context': 'https://schema.org',
  '@type': 'ImageGallery',
  '@id': `${SITE_URL}${path}#gallery`,
  name,
  url: absoluteUrl(path),
  publisher: { '@id': `${SITE_URL}/#organization` },
  image: items.slice(0, 30).map((item) => ({
    '@type': 'ImageObject',
    contentUrl: absoluteUrl(item.src),
    name: item.title,
    ...(item.caption ? { caption: item.caption } : {}),
    ...(item.href ? { mainEntityOfPage: absoluteUrl(item.href) } : {}),
  })),
});

/**
 * The guides index. Describing it as a list of the articles it links to is
 * what lets Google treat /guides as a hub rather than a thin page that happens
 * to repeat other pages' titles.
 */
export const articleListSchema = (articles = []) => ({
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  '@id': `${SITE_URL}/guides#list`,
  name: 'Care Dent guides',
  itemListElement: articles.map((article, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    url: absoluteUrl(`/guides/${article.slug}`),
    name: article.title,
  })),
});
