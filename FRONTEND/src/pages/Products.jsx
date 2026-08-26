import { useMemo, useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { ArrowUpRight, ArrowRight, Search, X } from 'lucide-react';
import Reveal from '../components/Reveal';
import useFetch from '../hooks/useFetch';
import { catalogApi } from '../lib/api';
import { DENTAL_CHAIRS, OTHER_EQUIPMENT } from '../data/products';
import { LoadingBlock } from '../components/ui';
import Seo from '../components/Seo';
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

export default function Products({ onOpenQuoteModal }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const category = (searchParams.get('category') || 'all').toLowerCase();

  const [term, setTerm] = useState(query);

  // Keep the box in sync when the URL changes from elsewhere (back button, links).
  useEffect(() => { setTerm(query); }, [query]);

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
        schema={breadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'Products', path: '/products' }])}
      />

      {/* HEADER */}
      <section className="relative overflow-hidden bg-blue-950 text-white page-hero">
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none mix-blend-screen transform -translate-y-1/2 translate-x-1/4" />

        <div className="relative container-page max-w-7xl text-center sm:text-left">
          <span className="block text-xs uppercase tracking-widest text-cyan-400 mb-6 font-bold">
            Catalogue
          </span>
          <h1 className="text-4xl sm:text-5xl tracking-tighter font-medium leading-[1.1] text-white">
            {query ? `Search results for "${query}"` : 'Dental Chairs & Clinical Equipment'}
          </h1>
          <p className="text-slate-400 text-base mt-4 max-w-2xl">
            {loading ? 'Loading catalogue…' : `${total} ${total === 1 ? 'result' : 'products'}`} · Gamma series chairs and
            Woodpecker clinical equipment, installed and supported pan-India.
          </p>

          {/* Catalogue search */}
          <div className="relative mt-10 max-w-lg mx-auto sm:mx-0">
            <Search className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="Search chairs, X-ray units, autoclaves, scalers…"
              aria-label="Search the catalogue"
              className="w-full pl-11 pr-4 py-3.5 backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder:text-slate-500 focus:border-cyan-400 focus:bg-white/10 outline-none transition-colors"
            />
          </div>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 mt-6">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={`text-sm font-medium px-5 py-2.5 rounded-full border transition-all active:scale-95 ${
                  category === cat.id
                    ? 'bg-cyan-600 text-white border-cyan-600 shadow-lg shadow-cyan-600/30'
                    : 'bg-white/5 text-slate-300 border-white/10 hover:border-white/25 hover:bg-white/10'
                }`}
              >
                {cat.label}
              </button>
            ))}

            {subCategoryLabel && (
              <button
                onClick={() => setCategory('all')}
                className="inline-flex items-center gap-2 text-sm font-medium px-5 py-2.5 rounded-full border bg-cyan-600 text-white border-cyan-600 shadow-lg shadow-cyan-600/30 transition-all active:scale-95"
                aria-label={`Clear the ${subCategoryLabel} filter`}
              >
                {subCategoryLabel}
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* RESULTS */}
      <section className="section-y">
        <div className="container-page max-w-7xl space-y-16">

          {loading && <LoadingBlock label="Loading products…" />}

          {!loading && chairs.length > 0 && (
            <div className="space-y-8">
              {category === 'all' && <h2 className="text-xs uppercase tracking-widest text-slate-400">Dental Chairs</h2>}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {chairs.map((chair, idx) => (
                  <Reveal key={chair._id || chair.slug} delay={idx * 80} y={24}>
                    <Link
                      to={`/products/${chair.slug}`}
                      className="group bg-white rounded-2xl border border-slate-200 hover:border-cyan-200 hover:shadow-xl hover:shadow-cyan-900/5 transition-all duration-500 h-full flex flex-col overflow-hidden"
                    >
                      <div className="relative h-56 bg-slate-50 overflow-hidden">
                        <img
                          src={chair.heroImage}
                          alt={chair.name}
                          loading="lazy"
                          className="w-full h-full object-contain p-4 mix-blend-multiply transition-transform duration-700 ease-out group-hover:scale-[1.08]"
                        />
                        {chair.series && (
                          <span className="absolute top-4 left-4 text-[10px] font-bold uppercase tracking-widest text-cyan-700 bg-cyan-50/90 border border-cyan-100 backdrop-blur-sm px-3 py-1.5 rounded-full">
                            {chair.series}
                          </span>
                        )}
                      </div>
                      <div className="p-6 flex flex-col flex-1 gap-3">
                        <h3 className="text-lg font-medium text-slate-900 group-hover:text-cyan-700 transition-colors">
                          {chair.name}
                        </h3>
                        <p className="text-sm text-slate-500 leading-relaxed line-clamp-2 flex-1">
                          {chair.description}
                        </p>
                        <span className="inline-flex items-center gap-1 text-sm font-semibold text-slate-600 group-hover:text-cyan-700 transition-colors mt-2">
                          View details
                          <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                        </span>
                      </div>
                    </Link>
                  </Reveal>
                ))}
              </div>
            </div>
          )}

          {!loading && equipment.length > 0 && (
            <div className="space-y-8">
              {category === 'all' && <h2 className="text-xs uppercase tracking-widest text-slate-400">Clinical Equipment</h2>}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {equipment.map((item, idx) => (
                  <Reveal key={item._id || item.slug} delay={idx * 80} y={24}>
                    <div className="group bg-white rounded-2xl border border-slate-200 hover:border-cyan-200 hover:shadow-xl hover:shadow-cyan-900/5 transition-all duration-500 h-full flex flex-col overflow-hidden">
                      <Link to={`/products/${item.slug}`} className="relative h-56 bg-slate-50 overflow-hidden block">
                        <img
                          src={item.heroImage || item.image}
                          alt={item.name}
                          loading="lazy"
                          className="w-full h-full object-contain p-4 transition-transform duration-700 ease-out group-hover:scale-[1.08]"
                        />
                        {item.brand && (
                          <span className="absolute top-4 left-4 text-[10px] font-bold uppercase tracking-widest text-slate-700 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full">
                            {item.brand}
                          </span>
                        )}
                      </Link>
                      <div className="p-6 flex flex-col flex-1 gap-3">
                        <Link to={`/products/${item.slug}`}>
                          <h3 className="text-lg font-medium text-slate-900 hover:text-cyan-700 transition-colors">{item.name}</h3>
                        </Link>
                        <p className="text-sm text-slate-500 leading-relaxed line-clamp-2 flex-1">
                          {item.description}
                        </p>
                        <button
                          onClick={() => onOpenQuoteModal && onOpenQuoteModal(item.name)}
                          className="inline-flex items-center justify-center gap-1.5 text-sm font-semibold text-white bg-blue-950 hover:bg-cyan-700 px-4 py-2.5 rounded-full transition-all active:scale-[0.98] mt-2 w-fit"
                        >
                          Request Quote
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          )}

          {!loading && total === 0 && (
            <div className="text-center py-16 space-y-3">
              <Search className="w-8 h-8 text-slate-300 mx-auto" />
              <h3 className="text-lg font-medium text-slate-900">
                {query ? `No products match "${query}"` : 'No products in this category yet'}
              </h3>
              <p className="text-sm text-slate-500">Try a different search term or browse all categories.</p>
            </div>
          )}

        </div>
      </section>
    </div>
  );
}
