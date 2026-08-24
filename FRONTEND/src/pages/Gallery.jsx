import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { X, ChevronLeft, ChevronRight, ArrowUpRight, ImageOff } from 'lucide-react';
import { GALLERY_ITEMS } from '../data/gallery';
import { COMPANY_DETAILS } from '../data/products';
import useCatalogue from '../hooks/useCatalogue';
import Reveal from '../components/Reveal';
import Seo from '../components/Seo';
import { breadcrumbSchema } from '../lib/seo';
import { metaFor } from '../lib/pageMeta';

const ALL = 'All';

/**
 * Merges the bundled gallery with whatever the admin has uploaded against
 * products, so new catalogue photography shows up here without a code change.
 * Bundled entries win on duplicate image paths.
 */
function useGalleryItems() {
  const { chairs, equipment, live } = useCatalogue();

  return useMemo(() => {
    const items = [...GALLERY_ITEMS];
    if (!live) return items;

    const seen = new Set(items.map((item) => item.src));
    for (const product of [...chairs, ...equipment]) {
      const images = product.images?.length ? product.images : [product.heroImage].filter(Boolean);
      images.forEach((src, index) => {
        if (!src || seen.has(src)) return;
        seen.add(src);
        items.push({
          id: `${product.slug}-${index}`,
          src,
          title: product.name,
          caption: product.tagline || product.category,
          category: product.kind === 'chair' ? 'Dental Chairs' : 'Equipment',
          href: `/products/${product.slug}`,
        });
      });
    }
    return items;
  }, [chairs, equipment, live]);
}

function Lightbox({ items, index, onClose, onStep }) {
  const item = items[index];

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') onStep(1);
      if (e.key === 'ArrowLeft') onStep(-1);
    };
    document.addEventListener('keydown', onKey);
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
    };
  }, [onClose, onStep]);

  if (!item) return null;

  return (
    <div
      className="fixed inset-0 z-[60] bg-blue-950/95 backdrop-blur-xl flex flex-col animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-label={item.title}
      onClick={onClose}
    >
      <div className="flex items-center justify-between px-5 sm:px-8 h-20 shrink-0">
        <div className="text-xs text-slate-400 tabular-nums">
          {index + 1} / {items.length}
        </div>
        <button
          onClick={onClose}
          className="p-2 text-slate-300 hover:text-white transition-colors"
          aria-label="Close"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center gap-2 sm:gap-6 px-4 pb-4 min-h-0">
        <button
          onClick={(e) => { e.stopPropagation(); onStep(-1); }}
          className="p-2 sm:p-3 rounded-full bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition-colors shrink-0"
          aria-label="Previous"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <figure
          className="flex-1 h-full flex flex-col items-center justify-center min-w-0"
          onClick={(e) => e.stopPropagation()}
        >
          <img
            key={item.src}
            src={item.src}
            alt={item.title}
            className="max-h-[65vh] max-w-full object-contain rounded-2xl animate-fade-in"
            loading="lazy"
            decoding="async"
          />
          <figcaption className="text-center mt-6 space-y-1.5 max-w-lg">
            <div className="text-lg font-medium text-white tracking-tight">{item.title}</div>
            {item.caption && <p className="text-sm text-slate-400 leading-relaxed">{item.caption}</p>}
            {item.href && (
              <Link
                to={item.href}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors pt-1"
              >
                <span>View product</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </figcaption>
        </figure>

        <button
          onClick={(e) => { e.stopPropagation(); onStep(1); }}
          className="p-2 sm:p-3 rounded-full bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition-colors shrink-0"
          aria-label="Next"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

export default function Gallery({ onOpenQuoteModal }) {
  const items = useGalleryItems();
  const [filter, setFilter] = useState(ALL);
  const [lightbox, setLightbox] = useState(null);

  const categories = useMemo(
    () => [ALL, ...Array.from(new Set(items.map((item) => item.category)))],
    [items]
  );

  const visible = useMemo(
    () => (filter === ALL ? items : items.filter((item) => item.category === filter)),
    [items, filter]
  );

  const step = useCallback(
    (delta) => setLightbox((i) => (i === null ? i : (i + delta + visible.length) % visible.length)),
    [visible.length]
  );

  return (
    <div className="min-h-screen bg-white text-slate-800">
      <Seo
        {...metaFor('/gallery')}
        schema={breadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'Gallery', path: '/gallery' }])}
      />

      {/* HEADER */}
      <section className="relative overflow-hidden bg-blue-950 text-white py-24 sm:py-32">
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none mix-blend-screen transform -translate-y-1/2 translate-x-1/4" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Reveal>
            <span className="block text-xs uppercase tracking-widest text-cyan-400 mb-6 font-bold">
              Gallery
            </span>
            <h1 className="text-4xl sm:text-5xl tracking-tighter font-medium leading-[1.1]">
              The equipment we sell, install and stand behind
            </h1>
          </Reveal>
          <Reveal delay={100}>
            <p className="text-slate-400 text-base leading-relaxed max-w-2xl mx-auto mt-6">
              Chairs, radiology, sterilization and the utility gear that keeps them running — photographed
              as they are supplied. Tap any image to see it full size.
            </p>
          </Reveal>
        </div>
      </section>

      {/* FILTERS + GRID */}
      <section className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <Reveal>
            <div className="flex flex-wrap items-center gap-2 mb-10">
              {/* Filtering closes the lightbox: its index points into `visible`. */}
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => { setFilter(category); setLightbox(null); }}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    filter === category
                      ? 'bg-blue-950 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {category}
                </button>
              ))}
              <span className="text-xs text-slate-400 ml-auto tabular-nums">
                {visible.length} {visible.length === 1 ? 'photo' : 'photos'}
              </span>
            </div>
          </Reveal>

          {visible.length === 0 ? (
            <div className="text-center py-24 text-slate-400">
              <ImageOff className="w-8 h-8 mx-auto mb-3" />
              <p className="text-sm">No photos in this category yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {visible.map((item, idx) => (
                <Reveal key={item.id} delay={(idx % 3) * 70} variant="scale">
                  <button
                    onClick={() => setLightbox(idx)}
                    className="group relative w-full aspect-4/3 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 text-left"
                  >
                    <img
                      src={item.src}
                      alt={item.title}
                      loading="lazy"
                      className="w-full h-full object-contain p-4 sm:p-6 group-hover:scale-105 transition-transform duration-700 ease-out"
                    />

                    {/* Caption sheet, revealed on hover / always on touch */}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-blue-950/90 via-blue-950/60 to-transparent px-4 sm:px-5 pt-10 pb-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-all duration-300">
                      <div className="text-sm font-medium text-white tracking-tight">{item.title}</div>
                      {item.caption && (
                        <p className="text-xs text-slate-300 mt-0.5 line-clamp-2 leading-snug">{item.caption}</p>
                      )}
                    </div>

                    <span className="absolute top-3 right-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-white/85 backdrop-blur px-2 py-1 rounded-full">
                      {item.category}
                    </span>
                  </button>
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="rounded-3xl bg-blue-950 text-white p-10 sm:p-14 flex flex-col lg:flex-row items-center justify-between gap-8">
              <div className="space-y-3 text-center lg:text-left">
                <h2 className="text-2xl sm:text-3xl tracking-tighter font-medium leading-snug">
                  Seen something that fits your clinic?
                </h2>
                <p className="text-slate-400 text-sm leading-relaxed max-w-xl">
                  Tell us the model and the room, and we will come back with a price and a site plan.
                  Or call {COMPANY_DETAILS.founder} directly on {COMPANY_DETAILS.phoneNumbers[0]}.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 shrink-0">
                <button
                  onClick={() => onOpenQuoteModal && onOpenQuoteModal()}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-semibold px-6 py-3 transition-colors"
                >
                  <span>Request a quote</span>
                  <ArrowUpRight className="w-4 h-4" />
                </button>
                <Link
                  to="/products"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 text-white text-sm font-medium px-6 py-3 hover:bg-white/10 transition-colors"
                >
                  Browse all products
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {lightbox !== null && (
        <Lightbox
          items={visible}
          index={lightbox}
          onClose={() => setLightbox(null)}
          onStep={step}
        />
      )}
    </div>
  );
}
