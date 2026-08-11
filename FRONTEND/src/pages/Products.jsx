import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ArrowUpRight, ArrowRight, Search } from 'lucide-react';
import { DENTAL_CHAIRS, OTHER_EQUIPMENT } from '../data/products';
import Reveal from '../components/Reveal';

const CATEGORIES = ['All', 'Dental Chairs', 'Equipment'];

export default function Products({ onOpenQuoteModal }) {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const query = searchParams.get('q') || '';
  const [activeCategory, setActiveCategory] = useState('All');

  const matchesQuery = (name, description) =>
    !query ||
    name.toLowerCase().includes(query.toLowerCase()) ||
    description.toLowerCase().includes(query.toLowerCase());

  const filteredChairs = activeCategory === 'Equipment'
    ? []
    : DENTAL_CHAIRS.filter((c) => matchesQuery(c.name, c.description));

  const filteredEquipment = activeCategory === 'Dental Chairs'
    ? []
    : OTHER_EQUIPMENT.filter((e) => matchesQuery(e.name, e.description));

  const totalResults = filteredChairs.length + filteredEquipment.length;

  return (
    <div className="min-h-screen bg-white text-slate-800">

      {/* HEADER */}
      <section className="bg-slate-50 border-b border-slate-200 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="block text-xs uppercase tracking-widest text-slate-400 mb-2">
            Catalogue
          </span>
          <h1 className="text-3xl sm:text-4xl tracking-tighter font-medium text-slate-900">
            {query ? `Search results for "${query}"` : 'Dental Chairs & Clinical Equipment'}
          </h1>
          <p className="text-slate-500 text-sm mt-3 max-w-xl">
            {totalResults} {totalResults === 1 ? 'result' : 'products'} · Gamma series chairs and Woodpecker
            clinical equipment, installed and supported pan-India.
          </p>

          {/* Category chips */}
          <div className="flex flex-wrap gap-2 mt-8">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`text-sm font-medium px-4 py-2 rounded-full border transition-all active:scale-95 ${
                  activeCategory === cat
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* RESULTS */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">

          {filteredChairs.length > 0 && (
            <div className="space-y-8">
              {activeCategory === 'All' && (
                <h2 className="text-xs uppercase tracking-widest text-slate-400">Dental Chairs</h2>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredChairs.map((chair, idx) => (
                  <Reveal key={chair.id} delay={idx * 80} y={24}>
                    <Link
                      to={`/products/${chair.slug}`}
                      className="group bg-white rounded-2xl border border-slate-200 hover:border-cyan-200 hover:shadow-xl hover:shadow-cyan-900/5 transition-all duration-500 h-full flex flex-col overflow-hidden"
                    >
                      <div className="relative h-56 bg-slate-50 overflow-hidden">
                        <img
                          src={chair.heroImage}
                          alt={chair.name}
                          className="w-full h-full object-contain p-4 mix-blend-multiply transition-transform duration-700 ease-out group-hover:scale-[1.08]"
                        />
                        <span className="absolute top-4 left-4 text-[10px] font-bold uppercase tracking-widest text-cyan-800 bg-cyan-100/90 backdrop-blur-sm px-3 py-1.5 rounded-full">
                          {chair.series}
                        </span>
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

          {filteredEquipment.length > 0 && (
            <div className="space-y-8">
              {activeCategory === 'All' && (
                <h2 className="text-xs uppercase tracking-widest text-slate-400">Clinical Equipment</h2>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredEquipment.map((item, idx) => (
                  <Reveal key={item.id} delay={idx * 80} y={24}>
                    <div className="group bg-white rounded-2xl border border-slate-200 hover:border-cyan-200 hover:shadow-xl hover:shadow-cyan-900/5 transition-all duration-500 h-full flex flex-col overflow-hidden">
                      <div className="relative h-56 bg-slate-50 overflow-hidden">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.08]"
                        />
                        <span className="absolute top-4 left-4 text-[10px] font-bold uppercase tracking-widest text-slate-700 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full">
                          {item.brand}
                        </span>
                      </div>
                      <div className="p-6 flex flex-col flex-1 gap-3">
                        <h3 className="text-lg font-medium text-slate-900">{item.name}</h3>
                        <p className="text-sm text-slate-500 leading-relaxed line-clamp-2 flex-1">
                          {item.description}
                        </p>
                        <button
                          onClick={() => onOpenQuoteModal && onOpenQuoteModal(item.name)}
                          className="inline-flex items-center justify-center gap-1.5 text-sm font-semibold text-white bg-slate-900 hover:bg-cyan-700 px-4 py-2.5 rounded-full transition-all active:scale-[0.98] mt-2 w-fit"
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

          {totalResults === 0 && (
            <div className="text-center py-16 space-y-3">
              <Search className="w-8 h-8 text-slate-300 mx-auto" />
              <h3 className="text-lg font-medium text-slate-900">No products match &quot;{query}&quot;</h3>
              <p className="text-sm text-slate-500">Try a different search term or browse all categories.</p>
            </div>
          )}

        </div>
      </section>

    </div>
  );
}
