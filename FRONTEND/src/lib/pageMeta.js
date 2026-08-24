/**
 * Title and description for every indexable route, keyed by path.
 *
 * Kept here rather than inline in each page so the build scripts can read the
 * same copy: scripts/generate-sitemap.mjs lists these routes, and
 * scripts/prerender-meta.mjs bakes them into per-route HTML. Editing a
 * description in one place updates the page, the sitemap and the link preview.
 *
 * Titles are written to survive the " | Care Dent" suffix inside ~60
 * characters; descriptions aim for 140-158 so Google shows them whole.
 */
export const PAGE_META = {
  '/': {
    title: 'Dental Equipment Supplier & Service in Chennai',
    description:
      'Care Dent supplies, installs and services dental chairs, X-ray units, compressors and autoclaves across India — certified engineers, spares held in stock.',
    priority: 1.0,
  },
  '/about': {
    title: 'About — 30 Years in Dental Equipment',
    description:
      'Founded by Mr. Sivakumar after 30 years in the field. Every Care Dent installation and repair is handled by trained staff — never subcontracted labour.',
    priority: 0.7,
  },
  '/products': {
    title: 'Dental Chairs, X-Ray Units & Clinic Equipment',
    description:
      'Gamma series dental chairs, portable and RVG X-ray units, compressors, autoclaves and handpieces — installation and service included on every unit.',
    priority: 0.9,
  },
  '/services': {
    title: 'Installation, Maintenance & Repair Services',
    description:
      "Site assessment, installation, preventive maintenance, breakdown repair and safety inspection for dental equipment — by Care Dent's own certified engineers.",
    priority: 0.9,
  },
  '/services/pre-installation': {
    title: 'Pre-Installation & Site Readiness Checklist',
    description:
      'Get the room right before the chair arrives: measurements, power, earthing, water, drainage, air and suction — plus a free Care Dent site assessment.',
    priority: 0.8,
  },
  '/gallery': {
    title: 'Clinic Gallery — Installations We Have Delivered',
    description:
      'Dental clinics Care Dent has fitted out across India — chairs, utility pipelines, X-ray rooms and full surgery installations, commissioned and handed over.',
    priority: 0.6,
  },
  '/track-order': {
    title: 'Track Your Order or Service Request',
    description:
      'Enter your Care Dent reference number to check the live status of an equipment order, service ticket or quotation — no account needed.',
    priority: 0.5,
  },
  '/contact': {
    title: 'Contact — Chennai Showroom & Support',
    description:
      'Talk to Care Dent in Mugalivakkam, Chennai about equipment, installation or a breakdown. Phone, WhatsApp and enquiry form — Monday to Saturday, 9 AM to 7 PM.',
    priority: 0.8,
  },
};

/** Routes deliberately kept out of the index and the sitemap. */
export const NOINDEX_ROUTES = ['/login', '/portal', '/admin'];

export const metaFor = (path) => PAGE_META[path] || {};
