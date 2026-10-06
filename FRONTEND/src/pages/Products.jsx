import { useMemo, useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { ArrowUpRight, Search, X } from 'lucide-react';
import Reveal from '../components/Reveal';
import useFetch from '../hooks/useFetch';
import { catalogApi } from '../lib/api';
import { DENTAL_CHAIRS, OTHER_EQUIPMENT } from '../data/products';
import { LoadingBlock } from '../components/ui';
import Seo from '../components/Seo';
import Breadcrumbs from '../components/Breadcrumbs';
import { breadcrumbSchema } from '../lib/seo';
import { metaFor } from '../lib/pageMeta';

const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'chairs', label: 'Dental Chairs' },
  { id: 'equipment', label: 'Equipment' },
];

/**
 * The narrower slugs the navbar mega-menu links to. They are not tabs of their
 * own - landing on one used to leave every tab unselected, with no way to see
 * or clear the filter that was actually applied - so the page shows the active
 * one as a fourth, dismissible chip. Keys match CATEGORY_ALIASES on the API.
 */
const SUB_CATEGORY_LABELS = {
  xray: 'X-Ray Units',
  'x-ray': 'X-Ray Units',
  radiology: 'X-Ray Units',
  autoclaves: 'Autoclaves',
  sterilization: 'Autoclaves',
  compressors: 'Compressors',
  utility: 'Compressors',
  scalers: 'Ultrasonic Scalers',
  prophylaxis: 'Ultrasonic Scalers',
  curing: 'Curing Lights',
  restorative: 'Curing Lights',
  micromotors: 'Micromotors',
  endodontics: 'Micromotors',
  stools: 'Stools & Furniture',
  furniture: 'Stools & Furniture',
  accessories: 'Accessories',
};

/**
 * Static catalogue shipped with the bundle. Used only if the API is
 * unreachable, so the public site never renders an empty shop.
 */
const FALLBACK = [
  ...DENTAL_CHAIRS.map((c) => ({ ...c, kind: 'chair', _id: c.id })),
  ...OTHER_EQUIPMENT.map((e) => ({
    ...e, kind: 'equipment', _id: e.id, slug: e.slug || e.id, heroImage: e.image,
  })),
];

// Declared once: the same array feeds the visible breadcrumb and the
// BreadcrumbList markup, so the two can never disagree.
const BREADCRUMB_TRAIL = [{ name: 'Home', path: '/' }, { name: 'Products', path: '/products' }];

export default function Products({ onOpenQuoteModal }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const category = (searchParams.get('category') || 'all').toLowerCase();

  const [term, setTerm] = useState(query);

  // Keep the box in sync when the URL changes from elsewhere (back button, a
  // mega-menu link). Adjusted during render rather than in an effect so the
  // box never paints one frame of stale text after a navigation.
  const [syncedQuery, setSyncedQuery] = useState(query);
  if (query !== syncedQuery) {
    setSyncedQuery(query);
    setTerm(query);
  }

  // Debounce typing into the URL so every keystroke isn't a request or a history entry.
  useEffect(() => {
    if (term === query) return undefined;
    const t = setTimeout(() => {
      const next = new URLSearchParams(searchParams);
      if (term.trim()) next.set('q', term.trim());
      else next.delete('q');
      setSearchParams(next, { replace: true });
    }, 350);
    return () => clearTimeout(t);
  }, [term, query, searchParams, setSearchParams]);

  const { data, loading, error } = useFetch(
    (signal) => catalogApi.list({ q: query || undefined, category: category !== 'all' ? category : undefined }, { signal }),
    [query, category]
  );

  const products = useMemo(() => {
    if (data?.data) return data.data;
    if (!error) return [];

    // Offline fallback: filter the bundled catalogue client-side.
    const q = query.toLowerCase();
    return FALLBACK.filter((p) => {
      const matchesQ = !q || `${p.name} ${p.description}`.toLowerCase().includes(q);
      const label = SUB_CATEGORY_LABELS[category];
      const matchesCat =
        category === 'all' ||
        (category === 'chairs' && p.kind === 'chair') ||
        (category === 'equipment' && p.kind === 'equipment') ||
        // Bundled products carry a display category ("Radiology"), never the
        // URL slug ("xray"), so match the label the slug stands for as well.
        (label && p.category?.toLowerCase() === label.toLowerCase()) ||
        p.category?.toLowerCase().includes(category);
      return matchesQ && matchesCat;
    });
  }, [data, error, query, category]);

  const subCategoryLabel = SUB_CATEGORY_LABELS[category];

  const chairs = products.filter((p) => p.kind === 'chair');
  const equipment = products.filter((p) => p.kind !== 'chair');
  const total = products.length;

  const setCategory = (id) => {
    const next = new URLSearchParams(searchParams);
    if (id === 'all') next.delete('category');
    else next.set('category', id);
    setSearchParams(next, { replace: true });
  };

  return (
    <div className="min-h-screen bg-white text-slate-800">
      <Seo
        {...metaFor('/products')}
        schema={breadcrumbSchema(BREADCRUMB_TRAIL)}
      />

      {/* HEADER */}
      <section className="relative overflow-hidden bg-blue-950 text-white page-hero">
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none mix-blend-screen transform -translate-y-1/2 translate-x-1/4" />

        <div className="relative container-page max-w-4xl text-center">
          <Reveal>
            <Breadcrumbs trail={BREADCRUMB_TRAIL} align="center" />
            <span className="block text-xs uppercase tracking-widest text-cyan-400 mb-6 font-bold">
              Catalogue
            </span>
            <h1 className="text-4xl sm:text-5xl tracking-tighter font-medium leading-[1.1]">
              {query ? `Search results for "${query}"` : 'Dental Chairs & Clinical Equipment'}
            </h1>
          </Reveal>
          <Reveal delay={100}>
            <p className="text-slate-400 text-base leading-relaxed max-w-2xl mx-auto mt-6">
              Gamma series chairs and Woodpecker clinical equipment, installed and supported all over Tamil Nadu.
            </p>
          </Reveal>

          <Reveal delay={180} y={16}>
            {/* Catalogue search — the same pill as the Track Order search */}
            <div className="mt-10 max-w-xl mx-auto flex items-center gap-3 rounded-full backdrop-blur-xl bg-white/5 border border-white/10 py-1.5 pl-5 pr-1.5 focus-within:border-cyan-400 focus-within:bg-white/10 transition-colors">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="search"
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                placeholder="Search chairs, X-ray units, autoclaves, scalers…"
                aria-label="Search the catalogue"
                className="flex-1 min-w-0 bg-transparent py-2.5 text-white text-sm placeholder:text-slate-500 outline-none"
              />
              {term && (
                <button
                  type="button"
                  onClick={() => setTerm('')}
                  aria-label="Clear search"
                  className="w-9 h-9 rounded-full text-slate-400 hover:text-white hover:bg-white/10 flex items-center justify-center shrink-0 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Category switch */}
            <div className="mt-5 inline-flex flex-wrap justify-center rounded-full border border-white/10 bg-white/5 p-1 text-sm font-medium">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={`px-5 py-2 rounded-full transition-colors ${
                    category === cat.id ? 'bg-white text-blue-950' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
              {subCategoryLabel && (
                <button
                  onClick={() => setCategory('all')}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white text-blue-950"
                  aria-label={`Clear the ${subCategoryLabel} filter`}
                >
                  {subCategoryLabel}
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </Reveal>
        </div>
      </section>

      {/* RESULTS */}
      <section className="section-y">
        <div className="container-page max-w-7xl space-y-20">

          {loading && <LoadingBlock label="Loading products…" />}

          {!loading && chairs.length > 0 && (
            <ProductGroup
              eyebrow="Dental Chairs"
              title="Gamma series chairs"
              count={chairs.length}
              showHeading={category === 'all' || category === 'chairs'}
            >
              {chairs.map((chair, idx) => (
                <ProductCard key={chair._id || chair.slug} product={chair} tag={chair.series} idx={idx} onOpenQuoteModal={onOpenQuoteModal} />
              ))}
            </ProductGroup>
          )}

          {!loading && equipment.length > 0 && (
            <ProductGroup
              eyebrow="Clinical Equipment"
              title={subCategoryLabel || 'Equipment for every operatory'}
              count={equipment.length}
              showHeading
            >
              {equipment.map((item, idx) => (
                <ProductCard key={item._id || item.slug} product={item} tag={item.brand} idx={idx} onOpenQuoteModal={onOpenQuoteModal} />
              ))}
            </ProductGroup>
          )}

          {!loading && total === 0 && (
            <Reveal>
              <div className="bg-white border border-slate-200 rounded-2xl p-10 sm:p-14 text-center space-y-5">
                <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200 text-slate-400 flex items-center justify-center mx-auto">
                  <Search className="w-6 h-6" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl tracking-tighter font-medium text-blue-950">
                    {query ? `No products match "${query}"` : 'No products in this category yet'}
                  </h3>
                  <p className="text-slate-500 max-w-md mx-auto">
                    Try a different search term, or tell us what you need — we source equipment beyond this catalogue.
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <button
                    onClick={() => onOpenQuoteModal?.(query)}
                    className="group inline-flex items-center gap-3 rounded-full bg-blue-950 hover:bg-blue-900 text-white text-sm py-1.5 pl-6 pr-1.5 transition-all active:scale-[0.98]"
                  >
                    <span>Request a Quote</span>
                    <span className="w-8 h-8 rounded-full bg-white text-blue-950 flex items-center justify-center">
                      <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </span>
                  </button>
                  <button
                    onClick={() => { setTerm(''); setSearchParams(new URLSearchParams(), { replace: true }); }}
                    className="inline-flex items-center rounded-full border border-slate-200 hover:border-cyan-300 hover:bg-slate-50 text-slate-700 font-medium text-sm px-6 py-3 transition-all active:scale-[0.98]"
                  >
                    Show all products
                  </button>
                </div>
              </div>
            </Reveal>
          )}

        </div>
      </section>

      {/* CTA — the same navy panel as the home page's closing section */}
      <section className="section-pb">
        <div className="container-page max-w-7xl">
          <Reveal variant="scale" scale={0.97}>
            <div className="relative overflow-hidden rounded-3xl bg-blue-950 text-white px-8 py-12 sm:px-14 sm:py-14">
              <svg
                className="absolute -right-24 -top-32 w-[560px] h-[560px] pointer-events-none"
                viewBox="0 0 600 600"
                fill="none"
              >
                {[60, 110, 160, 210, 260, 310, 360].map((r, i) => (
                  <circle key={r} cx="300" cy="300" r={r} stroke="white" strokeOpacity={0.12 - i * 0.006} strokeWidth="1" />
                ))}
              </svg>
              <div className="absolute inset-x-0 bottom-0 h-40 pointer-events-none">
                <div className="absolute -bottom-16 left-1/4 w-72 h-72 bg-cyan-500/25 rounded-full blur-3xl" />
                <div className="absolute -bottom-20 right-1/4 w-72 h-72 bg-blue-400/15 rounded-full blur-3xl" />
              </div>

              <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
                <div className="max-w-xl space-y-4">
                  <span className="block text-xs uppercase tracking-widest text-cyan-400 font-bold">Not sure what fits?</span>
                  <h2 className="text-3xl sm:text-4xl tracking-tighter font-medium leading-[1.1]">
                    Tell us about your clinic. We will suggest the right setup.
                  </h2>
                  <p className="text-slate-400 leading-relaxed">
                    Send your room size and budget — you get a written quotation and a free site check before anything is delivered.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 shrink-0">
                  <button
                    onClick={() => onOpenQuoteModal?.()}
                    className="group inline-flex items-center justify-between gap-3 rounded-full bg-white hover:bg-cyan-50 text-blue-950 text-sm py-1.5 pl-6 pr-1.5 transition-all active:scale-[0.98]"
                  >
                    <span>Request a Quote</span>
                    <span className="w-9 h-9 rounded-full bg-blue-950 text-white flex items-center justify-center">
                      <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </span>
                  </button>
                  <Link
                    to="/dental-clinic-setup"
                    className="inline-flex items-center justify-center rounded-full backdrop-blur-xl bg-white/5 border border-white/15 hover:bg-white/10 text-white font-medium text-sm px-6 py-3 transition-all active:scale-[0.98]"
                  >
                    Plan a full clinic setup
                  </Link>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}

/** One catalogue section: a heading in the site's eyebrow + title pattern, then the grid. */
function ProductGroup({ eyebrow, title, count, showHeading, children }) {
  return (
    <div className="space-y-10">
      {showHeading && (
        <Reveal>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 pb-6 border-b border-slate-200">
            <div>
              <span className="block text-xs uppercase tracking-widest text-cyan-600 mb-4 font-bold">{eyebrow}</span>
              <h2 className="text-3xl sm:text-4xl tracking-tighter font-medium text-blue-950 leading-[1.1]">{title}</h2>
            </div>
            <span className="text-sm text-slate-500">
              {count} {count === 1 ? 'product' : 'products'}
            </span>
          </div>
        </Reveal>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">{children}</div>
    </div>
  );
}

/**
 * Product tile. The image and title open the product page; the footer row
 * offers a quote. They are sibling links rather than one card-wide link,
 * because a link cannot contain a button.
 */
function ProductCard({ product, tag, idx, onOpenQuoteModal }) {
  const href = `/products/${product.slug}`;
  return (
    <Reveal delay={(idx % 3) * 80} y={24}>
      <div className="group h-full flex flex-col bg-white rounded-2xl border border-slate-200 overflow-hidden hover:border-cyan-200 hover:shadow-xl hover:shadow-cyan-900/5 transition-all duration-500">
        <Link to={href} className="relative block h-60 bg-slate-50 overflow-hidden">
          <img
            src={product.heroImage || product.image}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-contain p-6 mix-blend-multiply transition-transform duration-700 ease-out group-hover:scale-[1.06]"
          />
          {tag && (
            <span className="absolute top-4 left-4 text-xs uppercase tracking-widest text-slate-600 bg-white/90 backdrop-blur-sm border border-slate-200 px-3 py-1 rounded-full">
              {tag}
            </span>
          )}
          <span className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white border border-slate-200 text-blue-950 flex items-center justify-center opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
            <ArrowUpRight className="w-4 h-4" />
          </span>
        </Link>

        <div className="p-6 flex flex-col flex-1">
          <Link to={href}>
            <h3 className="text-xl font-medium tracking-tight text-blue-950 group-hover:text-cyan-700 transition-colors">
              {product.name}
            </h3>
          </Link>
          <p className="text-sm text-slate-500 leading-relaxed line-clamp-2 mt-2">{product.description}</p>

          <div className="mt-auto pt-6">
            <div className="flex items-center justify-between gap-3 pt-5 border-t border-slate-100">
              <button
                onClick={() => onOpenQuoteModal?.(product.name)}
                className="text-sm text-slate-700 hover:text-cyan-700 transition-colors"
              >
                Request Quote
              </button>
              <Link
                to={href}
                className="group/details inline-flex items-center gap-2 text-sm text-slate-500 hover:text-blue-950 transition-colors"
              >
                View details
                <span className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center group-hover/details:bg-blue-950 group-hover/details:border-blue-950 group-hover/details:text-white transition-colors duration-300">
                  <ArrowUpRight className="w-4 h-4" />
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Reveal>
  );
}
