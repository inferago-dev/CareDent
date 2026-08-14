import React, { useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { ArrowUpRight, ArrowRight, Search } from 'lucide-react';
import Reveal from '../components/Reveal';
import useFetch from '../hooks/useFetch';
import { catalogApi } from '../lib/api';
import { DENTAL_CHAIRS, OTHER_EQUIPMENT } from '../data/products';
import { LoadingBlock } from '../components/ui';

const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'chairs', label: 'Dental Chairs' },
  { id: 'equipment', label: 'Equipment' },
];

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
      const matchesCat =
        category === 'all' ||
        (category === 'chairs' && p.kind === 'chair') ||
        (category === 'equipment' && p.kind === 'equipment') ||
        p.category?.toLowerCase().includes(category);
      return matchesQ && matchesCat;
    });
  }, [data, error, query, category]);

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

      {/* HEADER */}
      <section className="relative overflow-hidden bg-blue-950 text-white py-24">
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none mix-blend-screen transform -translate-y-1/2 translate-x-1/4" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center sm:text-left">
          <span className="block text-xs uppercase tracking-widest text-cyan-400 mb-4 font-bold">
            Catalogue
          </span>
          <h1 className="text-4xl sm:text-5xl tracking-tighter font-medium text-white">
            {query ? `Search results for "${query}"` : 'Dental Chairs & Clinical Equipment'}
          </h1>
          <p className="text-slate-400 text-base mt-4 max-w-2xl">
            {loading ? 'Loading catalogue…' : `${total} ${total === 1 ? 'result' : 'products'}`} · Gamma series chairs and
            Woodpecker clinical equipment, installed and supported pan-India.
          </p>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-10">
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
            {query && (
              <button
                onClick={() => setSearchParams(category === 'all' ? {} : { category }, { replace: true })}
                className="text-sm font-medium px-5 py-2.5 rounded-full border border-white/10 bg-white/5 text-slate-300 hover:border-white/25 transition-all"
              >
                Clear search ×
              </button>
            )}
          </div>
        </div>
      </section>

      {/* RESULTS */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">

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
