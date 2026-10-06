import { useState, useMemo, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { X, ChevronLeft, ChevronRight, ArrowUpRight, ImageOff, Maximize2 } from 'lucide-react';
import { GALLERY_ITEMS } from '../data/gallery';
import { COMPANY_DETAILS } from '../data/products';
import useCatalogue from '../hooks/useCatalogue';
import Reveal from '../components/Reveal';
import useBodyScrollLock from '../hooks/useBodyScrollLock';
import Seo from '../components/Seo';
import Breadcrumbs from '../components/Breadcrumbs';
import { breadcrumbSchema, imageGallerySchema } from '../lib/seo';
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
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose, onStep]);

  // Was a private copy of the same lock; sharing the hook means a lightbox
  // opened over another overlay releases the page only once, not on the first
  // close.
  useBodyScrollLock(true);

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
          className="w-10 h-10 rounded-full border border-white/15 bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center gap-2 sm:gap-6 px-4 pb-4 min-h-0">
        <button
          onClick={(e) => { e.stopPropagation(); onStep(-1); }}
          className="w-11 h-11 rounded-full bg-white/5 border border-white/15 text-slate-300 hover:text-blue-950 hover:bg-white flex items-center justify-center transition-colors shrink-0"
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
            decoding="async"
          />
          <figcaption className="text-center mt-6 space-y-1.5 max-w-lg">
            <div className="text-lg font-medium text-white tracking-tight">{item.title}</div>
            {item.caption && <p className="text-sm text-slate-400 leading-relaxed">{item.caption}</p>}
            {item.href && (
              <div className="pt-3">
                <Link
                  to={item.href}
                  className="group inline-flex items-center gap-3 rounded-full bg-white hover:bg-cyan-50 text-blue-950 font-medium text-sm py-1.5 pl-5 pr-1.5 transition-all active:scale-[0.98]"
                >
                  <span>View product</span>
                  <span className="w-8 h-8 rounded-full bg-blue-950 text-white flex items-center justify-center">
                    <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </span>
                </Link>
              </div>
            )}
          </figcaption>
        </figure>

        <button
          onClick={(e) => { e.stopPropagation(); onStep(1); }}
          className="w-11 h-11 rounded-full bg-white/5 border border-white/15 text-slate-300 hover:text-blue-950 hover:bg-white flex items-center justify-center transition-colors shrink-0"
          aria-label="Next"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

// Declared once: the same array feeds the visible breadcrumb and the
// BreadcrumbList markup, so the two can never disagree.
const BREADCRUMB_TRAIL = [{ name: 'Home', path: '/' }, { name: 'Gallery', path: '/gallery' }];

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
        schema={[
          breadcrumbSchema(BREADCRUMB_TRAIL),
          imageGallerySchema(items, { name: 'Care Dent clinic installations', path: '/gallery' }),
        ]}
      />

      {/* HEADER */}
      <section className="relative overflow-hidden bg-blue-950 text-white page-hero">
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none mix-blend-screen transform -translate-y-1/2 translate-x-1/4" />

        <div className="relative container-page max-w-4xl text-center">
          <Reveal>
            <Breadcrumbs trail={BREADCRUMB_TRAIL} align="center" />
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
      <section className="section-y">
        <div className="container-page max-w-7xl">

          <Reveal>
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 pb-8 mb-10 border-b border-slate-200">
              <div>
                <span className="block text-xs uppercase tracking-widest text-cyan-600 mb-4 font-bold">Browse</span>
                <h2 className="text-3xl sm:text-4xl tracking-tighter font-medium text-blue-950 leading-[1.1]">
                  {filter === ALL ? 'Every photo' : filter}
                </h2>
                <p className="text-sm text-slate-500 mt-2 tabular-nums">
                  {visible.length} {visible.length === 1 ? 'photo' : 'photos'}
                </p>
              </div>

              {/* Category switch. Filtering closes the lightbox: its index points into `visible`. */}
              <div className="inline-flex flex-wrap rounded-full border border-slate-200 bg-slate-50 p-1 text-sm font-medium w-fit">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => { setFilter(category); setLightbox(null); }}
                    className={`px-4 py-2 rounded-full transition-colors ${
                      filter === category ? 'bg-blue-950 text-white' : 'text-slate-500 hover:text-blue-950'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </Reveal>

          {visible.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200 text-slate-400 flex items-center justify-center mx-auto">
                <ImageOff className="w-6 h-6" />
              </div>
              <p className="text-slate-500">No photos in this category yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {visible.map((item, idx) => (
                <Reveal key={item.id} delay={(idx % 3) * 80} variant="scale" scale={0.97}>
                  <button
                    onClick={() => setLightbox(idx)}
                    className="group w-full h-full flex flex-col text-left bg-white rounded-2xl border border-slate-200 overflow-hidden hover:border-cyan-200 hover:shadow-xl hover:shadow-cyan-900/5 transition-all duration-500"
                  >
                    <div className="relative w-full aspect-4/3 bg-slate-50 overflow-hidden">
                      <img
                        src={item.src}
                        alt={item.title}
                        loading="lazy"
                        className="w-full h-full object-contain p-6 mix-blend-multiply group-hover:scale-[1.06] transition-transform duration-700 ease-out"
                      />
                      <span className="absolute top-4 left-4 text-xs uppercase tracking-widest text-slate-600 bg-white/90 backdrop-blur-sm border border-slate-200 px-3 py-1 rounded-full">
                        {item.category}
                      </span>
                      <span className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white border border-slate-200 text-blue-950 flex items-center justify-center opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 group-focus-visible:opacity-100 transition-all duration-300">
                        <Maximize2 className="w-4 h-4" />
                      </span>
                    </div>

                    <div className="flex items-end justify-between gap-3 p-5 flex-1">
                      <div className="min-w-0">
                        <h3 className="text-lg font-medium tracking-tight text-blue-950 group-hover:text-cyan-700 transition-colors truncate">
                          {item.title}
                        </h3>
                        {item.caption && (
                          <p className="text-sm text-slate-500 mt-1 line-clamp-1">{item.caption}</p>
                        )}
                      </div>
                      <span className="w-8 h-8 rounded-full border border-slate-200 text-slate-500 flex items-center justify-center shrink-0 group-hover:bg-blue-950 group-hover:border-blue-950 group-hover:text-white transition-colors duration-300">
                        <ArrowUpRight className="w-4 h-4" />
                      </span>
                    </div>
                  </button>
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA — the same navy panel as the site's other closing sections */}
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
                  <span className="block text-xs uppercase tracking-widest text-cyan-400 font-bold">Like what you see?</span>
                  <h2 className="text-3xl sm:text-4xl tracking-tighter font-medium leading-[1.1]">
                    Seen something that fits your clinic?
                  </h2>
                  <p className="text-slate-400 leading-relaxed">
                    Tell us the model and the room, and we will come back with a price and a site plan.
                    Or call {COMPANY_DETAILS.founder} directly on {COMPANY_DETAILS.phoneNumbers[0]}.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 shrink-0">
                  <button
                    onClick={() => onOpenQuoteModal && onOpenQuoteModal()}
                    className="group inline-flex items-center justify-between gap-3 rounded-full bg-white hover:bg-cyan-50 text-blue-950 text-sm py-1.5 pl-6 pr-1.5 transition-all active:scale-[0.98]"
                  >
                    <span>Request a Quote</span>
                    <span className="w-9 h-9 rounded-full bg-blue-950 text-white flex items-center justify-center">
                      <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </span>
                  </button>
                  <Link
                    to="/products"
                    className="inline-flex items-center justify-center rounded-full backdrop-blur-xl bg-white/5 border border-white/15 hover:bg-white/10 text-white font-medium text-sm px-6 py-3 transition-all active:scale-[0.98]"
                  >
                    Browse all products
                  </Link>
                </div>
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
