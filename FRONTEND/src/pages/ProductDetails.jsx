import { useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  CheckCircle2, Download, ArrowUpRight, ShieldCheck,
  Sparkles, FileText, ChevronLeft, Ruler,
} from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import { DENTAL_CHAIRS, OTHER_EQUIPMENT, COMPANY_DETAILS } from '../data/products';
import { requirementsFor } from '../data/preInstallation';
import downloadPreInstallationPdf from '../lib/preInstallationPdf';
import useFetch from '../hooks/useFetch';
import { catalogApi } from '../lib/api';
import { LoadingBlock } from '../components/ui';
import NotFound from './NotFound';
import Seo from '../components/Seo';
import Breadcrumbs from '../components/Breadcrumbs';
import Reveal from '../components/Reveal';
import { productSchema, breadcrumbSchema } from '../lib/seo';

/** Bundled catalogue, used only when the API cannot be reached. */
function findFallback(slug) {
  const chair = DENTAL_CHAIRS.find((c) => c.slug === slug);
  if (chair) return { ...chair, kind: 'chair' };
  const item = OTHER_EQUIPMENT.find((e) => (e.slug || e.id) === slug);
  if (item) {
    return {
      ...item, kind: 'equipment', slug: item.slug || item.id,
      heroImage: item.image, images: [item.image],
      keyDifferentiators: item.keyDifferentiators || [], specifications: item.specifications || [],
    };
  }
  return null;
}

export default function ProductDetails({ onOpenQuoteModal }) {
  const { slug } = useParams();
  const navigate = useNavigate();

  const { data, loading, error } = useFetch(
    (signal) => catalogApi.get(slug, { signal }),
    [slug]
  );

  const product = useMemo(() => data?.data || (error ? findFallback(slug) : null), [data, error, slug]);
  const related = useMemo(() => {
    if (data?.related?.length) return data.related;
    if (!error || !product) return [];
    const pool = product.kind === 'chair' ? DENTAL_CHAIRS : OTHER_EQUIPMENT;
    return pool
      .filter((p) => (p.slug || p.id) !== slug)
      .slice(0, 3)
      .map((p) => ({ ...p, slug: p.slug || p.id, heroImage: p.heroImage || p.image }));
  }, [data, error, product, slug]);

  const gallery = product?.images?.length ? product.images : product?.heroImage ? [product.heroImage] : [];

  /**
   * Which gallery image is showing.
   *
   * Stored with the slug it belongs to, so navigating to another product falls
   * back to that product's first image without an effect resetting it after
   * the fact - and so an image chosen by hand survives the catalogue arriving
   * from the API and replacing the bundled fallback.
   */
  const [picked, setPicked] = useState({ slug: null, src: null });
  const selectedImage = (picked.slug === slug && picked.src) || gallery[0] || null;

  // Dark background: the navbar is fixed and transparent until you scroll, so
  // a white panel at the top of the page would make its white logo invisible.
  if (loading) {
    return (
      <div className="min-h-screen bg-blue-950 flex items-center justify-center">
        <LoadingBlock label="Loading product…" dark />
      </div>
    );
  }
  if (!product) return <NotFound />;

  // One array for the visible breadcrumb and the BreadcrumbList markup.
  const trail = [
    { name: 'Home', path: '/' },
    { name: 'Products', path: '/products' },
    { name: product.name, path: `/products/${product.slug || slug}` },
  ];

  const specs = product.specifications || [];
  const features = product.keyDifferentiators || [];
  const hasBrochure = product.brochureUrl && product.brochureUrl !== '#';
  const installRequirements = requirementsFor(product);

  return (
    <div className="min-h-screen bg-white text-slate-800">
      <Seo
        type="product"
        title={product.name}
        description={product.description || product.tagline}
        image={product.heroImage || product.images?.[0]}
        canonical={`/products/${product.slug || slug}`}
        schema={[
          productSchema({ ...product, slug: product.slug || slug }),
          breadcrumbSchema(trail),
        ]}
      />

      {/* Dark breadcrumb band. Every other public page opens on blue-950; the
          navbar is fixed and transparent until scroll, so this page needs the
          same dark top or the white logo and nav links vanish against white. */}
      <section className="relative overflow-hidden bg-blue-950 text-white page-band">
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none mix-blend-screen transform -translate-y-1/2 translate-x-1/4" />

        <div className="relative container-page max-w-7xl flex items-center justify-between gap-4">
          <Breadcrumbs trail={trail} className="mb-0 min-w-0" />
          <button
            onClick={() => navigate('/products')}
            className="text-xs text-slate-300 hover:text-cyan-400 flex items-center gap-1 shrink-0 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Products</span>
          </button>
        </div>
      </section>

      <div className="container-page max-w-7xl space-y-16 section-y-tight">

        {/* GALLERY + INFO */}
        <Reveal y={24}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">

            <div className="lg:col-span-7 space-y-4">
              <div className="relative aspect-[4/3] bg-slate-50 rounded-2xl overflow-hidden border border-slate-200 group">
                {selectedImage ? (
                  <img
                    key={selectedImage}
                    src={selectedImage}
                    alt={product.name}
                    className="w-full h-full object-contain p-8 mix-blend-multiply group-hover:scale-105 transition-transform duration-700 ease-out animate-fade-in"
                    fetchPriority="high"
                    decoding="async"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-sm text-slate-400">
                    Photo coming soon
                  </div>
                )}
                {product.badge && (
                  <span className="absolute top-4 left-4 text-xs uppercase tracking-widest text-white bg-blue-950 px-3 py-1 rounded-full">
                    {product.badge}
                  </span>
                )}
              </div>

              {gallery.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {gallery.map((img, idx) => (
                    <button
                      key={`${img}-${idx}`}
                      onClick={() => setPicked({ slug, src: img })}
                      className={`w-20 h-20 rounded-xl overflow-hidden border transition-all shrink-0 bg-slate-50 ${
                        selectedImage === img ? 'border-blue-950 ring-2 ring-blue-950/10' : 'border-slate-200 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt={`${product.name} — view ${idx + 1}`} className="w-full h-full object-contain p-1.5 mix-blend-multiply" loading="lazy" decoding="async" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="lg:col-span-5 flex flex-col gap-8">
              <div>
                <div className="flex items-center gap-3 mb-5 flex-wrap">
                  {(product.series || product.category) && (
                    <span className="text-xs uppercase tracking-widest text-cyan-600 font-bold">
                      {product.series || product.category}
                    </span>
                  )}
                  <span className="text-xs text-slate-400">
                    Model code CD-{String(product.slug).toUpperCase()}
                  </span>
                </div>

                <h1 className="text-3xl sm:text-4xl tracking-tighter font-medium leading-[1.1] text-blue-950">
                  {product.name}
                </h1>

                {product.tagline && <p className="text-cyan-700 text-base mt-3">{product.tagline}</p>}

                <p className="text-slate-500 mt-4 leading-relaxed">{product.description}</p>
              </div>

              {features.length > 0 && (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-4">
                  <div className="text-xs uppercase tracking-widest text-slate-400">Key features &amp; inclusions</div>
                  <ul className="space-y-3">
                    {features.map((feat, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-slate-700 leading-snug">
                        <span className="w-5 h-5 rounded-full bg-blue-950 text-white flex items-center justify-center shrink-0 mt-px">
                          <CheckCircle2 className="w-3 h-3" />
                        </span>
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mt-auto space-y-5">
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => onOpenQuoteModal && onOpenQuoteModal(product.name)}
                    className="group flex-1 inline-flex items-center justify-between gap-3 rounded-full bg-blue-950 hover:bg-blue-900 text-white text-sm py-1.5 pl-6 pr-1.5 transition-all active:scale-[0.98]"
                  >
                    <span>Request Quotation</span>
                    <span className="w-9 h-9 rounded-full bg-white text-blue-950 flex items-center justify-center">
                      <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </span>
                  </button>

                  <a
                    href={`https://wa.me/${COMPANY_DETAILS.whatsappNumber}?text=${encodeURIComponent(`Hello Care Dent, I am interested in ${product.name}.`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-100 hover:bg-slate-200/70 border border-slate-200 text-slate-800 font-medium text-sm px-6 py-3 transition-all active:scale-[0.98]"
                  >
                    <FaWhatsapp className="w-4 h-4 text-emerald-600" />
                    <span>WhatsApp</span>
                  </a>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-5 border-t border-slate-200">
                  <div className="flex items-center gap-3">
                    <span className="w-9 h-9 rounded-full bg-slate-50 border border-slate-200 text-blue-950 flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-4 h-4" />
                    </span>
                    <span className="text-sm text-slate-600 leading-tight">Free installation included</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="w-9 h-9 rounded-full bg-slate-50 border border-slate-200 text-blue-950 flex items-center justify-center shrink-0">
                      <Sparkles className="w-4 h-4" />
                    </span>
                    <span className="text-sm text-slate-600 leading-tight">1-year full warranty</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        {/* SPECIFICATIONS */}
        {specs.length > 0 && (
          <Reveal y={24}>
            <div className="bg-white rounded-2xl border border-slate-200 p-7 sm:p-9 space-y-7">
              <SectionHeading
                eyebrow="Specifications"
                title="Technical specifications"
                sub={`Manufacturer specification chart for ${product.name}.`}
              />
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left border-collapse">
                  <tbody>
                    {specs.map((spec, idx) => (
                      <tr key={idx} className="odd:bg-slate-50 even:bg-white">
                        <td className="py-3.5 px-5 text-sm text-slate-500 w-1/3 border-b border-slate-100">
                          {spec.label}
                        </td>
                        <td className="py-3.5 px-5 text-sm text-slate-800 border-b border-slate-100">
                          {spec.value}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Reveal>
        )}

        {/* INSTALLATION REQUIREMENTS */}
        <Reveal y={24}>
          <div className="bg-white rounded-2xl border border-slate-200 p-7 sm:p-9 space-y-7">
            <SectionHeading
              icon={Ruler}
              eyebrow="Site readiness"
              title="Installation requirements"
              sub={`What the room needs before ${product.name} can be installed. Figures are typical — the site assessment confirms them against your clinic.`}
            />

            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {installRequirements.map((requirement) => (
                <li key={requirement} className="flex items-start gap-3 bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <span className="w-5 h-5 rounded-full bg-white border border-slate-200 text-cyan-600 flex items-center justify-center shrink-0 mt-px">
                    <CheckCircle2 className="w-3 h-3" />
                  </span>
                  <span className="text-sm text-slate-600 leading-relaxed">{requirement}</span>
                </li>
              ))}
            </ul>

            <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-4 pt-6 border-t border-slate-200">
              <Link
                to="/services/pre-installation"
                className="text-sm text-slate-500 hover:text-blue-950 transition-colors"
              >
                Full checklist, including optional Vastu layout guidance →
              </Link>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => downloadPreInstallationPdf(product)}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 hover:border-cyan-300 hover:bg-slate-50 text-slate-700 font-medium text-sm px-5 py-3 transition-all active:scale-[0.98]"
                >
                  <Download className="w-4 h-4" />
                  <span>Download PDF</span>
                </button>
                <Link
                  to={`/services/pre-installation?equipment=${encodeURIComponent(product.name)}#request-assessment`}
                  className="group inline-flex items-center justify-between gap-3 rounded-full bg-blue-950 hover:bg-blue-900 text-white font-medium text-sm py-1.5 pl-6 pr-1.5 transition-all active:scale-[0.98]"
                >
                  <span>Request site assessment</span>
                  <span className="w-8 h-8 rounded-full bg-white text-blue-950 flex items-center justify-center">
                    <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </Reveal>

        {/* BROCHURE — the same navy panel as the site's other dark sections */}
        <Reveal variant="scale" scale={0.97}>
          <div className="relative overflow-hidden rounded-3xl bg-blue-950 text-white px-8 py-10 sm:px-12 sm:py-12">
            <svg
              className="absolute -right-24 -top-32 w-[520px] h-[520px] pointer-events-none"
              viewBox="0 0 600 600"
              fill="none"
            >
              {[60, 110, 160, 210, 260, 310, 360].map((r, i) => (
                <circle key={r} cx="300" cy="300" r={r} stroke="white" strokeOpacity={0.12 - i * 0.006} strokeWidth="1" />
              ))}
            </svg>
            <div className="absolute -bottom-24 left-1/4 w-72 h-72 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />

            <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="space-y-3 max-w-xl">
                <span className="block text-xs uppercase tracking-widest text-cyan-400 font-bold">Technical datasheet</span>
                <h2 className="text-2xl sm:text-3xl tracking-tighter font-medium leading-[1.15]">
                  {product.name} specification sheet
                </h2>
                <p className="text-slate-400 leading-relaxed">
                  {hasBrochure
                    ? 'Includes dimension drawings, utility pipeline specs and colour options.'
                    : 'Not published online yet — request it and we will email it to you the same day.'}
                </p>
              </div>

              <a
                href={hasBrochure
                  ? product.brochureUrl
                  : `mailto:${COMPANY_DETAILS.email}?subject=${encodeURIComponent(`Datasheet request: ${product.name}`)}`}
                {...(hasBrochure ? { target: '_blank', rel: 'noreferrer' } : {})}
                className="group inline-flex items-center justify-between gap-3 rounded-full bg-white hover:bg-cyan-50 text-blue-950 font-medium text-sm py-1.5 pl-6 pr-1.5 shrink-0 transition-all active:scale-[0.98]"
              >
                <span>{hasBrochure ? 'Download brochure PDF' : 'Request the datasheet'}</span>
                <span className="w-9 h-9 rounded-full bg-blue-950 text-white flex items-center justify-center">
                  {hasBrochure ? <Download className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                </span>
              </a>
            </div>
          </div>
        </Reveal>

        {/* RELATED */}
        {related.length > 0 && (
          <div className="space-y-8">
            <Reveal>
              <div className="flex items-end justify-between gap-4 pb-6 border-b border-slate-200">
                <div>
                  <span className="block text-xs uppercase tracking-widest text-cyan-600 mb-4 font-bold">Keep browsing</span>
                  <h2 className="text-3xl sm:text-4xl tracking-tighter font-medium text-blue-950 leading-[1.1]">
                    Explore related models
                  </h2>
                </div>
                <Link to="/products" className="hidden sm:inline-flex text-sm text-slate-500 hover:text-blue-950 transition-colors">
                  View all products →
                </Link>
              </div>
            </Reveal>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {related.slice(0, 3).map((rc, idx) => (
                <Reveal key={rc.slug} delay={idx * 80} y={24}>
                  <Link
                    to={`/products/${rc.slug}`}
                    className="group h-full flex flex-col bg-white rounded-2xl border border-slate-200 overflow-hidden hover:border-cyan-200 hover:shadow-xl hover:shadow-cyan-900/5 transition-all duration-500"
                  >
                    <div className="h-48 bg-slate-50 overflow-hidden">
                      <img
                        src={rc.heroImage}
                        alt={rc.name}
                        loading="lazy"
                        className="w-full h-full object-contain p-5 mix-blend-multiply group-hover:scale-[1.06] transition-transform duration-700 ease-out"
                      />
                    </div>
                    <div className="p-6 flex items-end justify-between gap-3 flex-1">
                      <div className="min-w-0">
                        <div className="text-xs uppercase tracking-widest text-slate-400">{rc.series || rc.category}</div>
                        <h3 className="text-lg font-medium tracking-tight text-blue-950 mt-1 group-hover:text-cyan-700 transition-colors">{rc.name}</h3>
                        {rc.tagline && <p className="text-sm text-slate-500 mt-1 line-clamp-1">{rc.tagline}</p>}
                      </div>
                      <span className="w-8 h-8 rounded-full border border-slate-200 text-slate-500 flex items-center justify-center shrink-0 group-hover:bg-blue-950 group-hover:border-blue-950 group-hover:text-white transition-colors duration-300">
                        <ArrowUpRight className="w-4 h-4" />
                      </span>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

/** Card heading in the site's eyebrow + title pattern, with an optional icon box. */
function SectionHeading({ icon: Icon, eyebrow, title, sub }) {
  return (
    <div className="flex items-start gap-4 pb-6 border-b border-slate-200">
      {Icon && (
        <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 text-blue-950 flex items-center justify-center shrink-0">
          <Icon className="w-5 h-5" />
        </div>
      )}
      <div className="space-y-2">
        <span className="block text-xs uppercase tracking-widest text-cyan-600 font-bold">{eyebrow}</span>
        <h2 className="text-2xl sm:text-3xl tracking-tighter font-medium text-blue-950 leading-[1.1]">{title}</h2>
        {sub && <p className="text-sm text-slate-500 leading-relaxed max-w-2xl">{sub}</p>}
      </div>
    </div>
  );
}
