import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, ChevronRight } from 'lucide-react';
import useCatalogue from '../../hooks/useCatalogue';
import Reveal from '../Reveal';
import useParallax from '../../hooks/useParallax';


export default function FlagshipModelsSection({ onOpenQuoteModal }) {
  const parallaxRef = useParallax(0.04);
  const { chairs } = useCatalogue();
  const CHAIRS = chairs.slice(0, 3);

  return (
    <section className="relative z-5 py-20 bg-white overflow-hidden">
      <div ref={parallaxRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 will-change-transform w-full">

        {/* Header row */}
        <Reveal>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <span className="block text-xs uppercase tracking-widest text-slate-400 mb-3 font-medium">
                Flagship Models
              </span>
              <h2 className="text-3xl sm:text-4xl font-semibold tracking-tighter text-blue-950 leading-[1.1]">
                Dental chairs built for the clinic of tomorrow
              </h2>
            </div>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 text-sm font-medium text-blue-950 shrink-0 hover:text-cyan-600 tracking-tighter transition-colors group"
            >
              All models <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </Reveal>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {CHAIRS.map((chair, idx) => (
            <Reveal key={chair.id} delay={idx * 100}>
              <div className="group relative flex flex-col rounded-3xl bg-white border border-slate-100 hover:shadow-blue-950/10 hover:-translate-y-1.5 overflow-hidden transition-all duration-500 h-full cursor-pointer">

                {/* Image area */}
                <div className="relative h-52 overflow-hidden bg-slate-100">
                  <img
                    src={chair.heroImage}
                    alt={chair.name}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                    loading="lazy"
                    decoding="async"
                  />
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-950/70 via-blue-950/10 to-transparent" />

                  {/* Badge */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <span className="inline-flex items-center gap-1 text-xs uppercase text-white bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-full">

                      {chair.badge}
                    </span>
                  </div>

                  {/* Series label bottom */}
                  <div className="absolute bottom-3 left-4">
                    <span className="text-[10px] uppercase tracking-widest text-white/50 font-medium">{chair.series}</span>
                    <h3 className="text-lg font-semibold text-white tracking-tight leading-tight mt-0.5">{chair.name}</h3>
                  </div>

                  {/* Arrow icon top-right */}
                  <Link
                    to={`/products/${chair.slug}`}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-blue-950 transition-all duration-300"
                  >
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>
                </div>

                {/* Card Body */}
                <div className="flex flex-col flex-1 p-5 gap-4">

                  {/* Rating + tagline */}
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-xs text-slate-500 leading-snug flex-1 line-clamp-2">{chair.tagline}</p>
                  </div>

                  {/* Feature Chips */}
                  <div className="flex flex-wrap gap-1.5">
                    {chair.keyDifferentiators.slice(0, 3).map((d, i) => (
                      <span
                        key={i}
                        className="text-[10px] font-medium text-cyan-700 bg-cyan-50 border border-cyan-100 rounded-full px-2.5 py-1 leading-none"
                      >
                        {d.split(' ').slice(0, 4).join(' ')}
                      </span>
                    ))}
                  </div>

                  {/* Divider + CTAs */}
                  <div className="mt-auto border-t border-slate-100 pt-4 flex items-center justify-between gap-3">
                    <button
                      onClick={() => onOpenQuoteModal(chair.name)}
                      className="flex-1 text-xs font-semibold text-white bg-blue-950 hover:bg-cyan-600 px-4 py-2.5 rounded-full transition-all duration-300 tracking-tight text-center"
                    >
                      Get Quote
                    </button>
                    <Link
                      to={`/products/${chair.slug}`}
                      className="text-xs font-medium text-slate-500 hover:text-blue-950 transition-colors whitespace-nowrap inline-flex items-center gap-1"
                    >
                      Details <ArrowUpRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>

              </div>
            </Reveal>
          ))}
        </div>

      </div>
    </section>
  );
}
