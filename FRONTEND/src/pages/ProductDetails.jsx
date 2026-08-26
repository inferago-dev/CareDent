import { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  CheckCircle2, Download, MessageSquare, ArrowRight, ShieldCheck,
  Sparkles, FileText, ChevronLeft, Ruler, ClipboardCheck,
} from 'lucide-react';
import { DENTAL_CHAIRS, OTHER_EQUIPMENT, COMPANY_DETAILS } from '../data/products';
import { requirementsFor } from '../data/preInstallation';
import downloadPreInstallationPdf from '../lib/preInstallationPdf';
import useFetch from '../hooks/useFetch';
import { catalogApi } from '../lib/api';
import { LoadingBlock } from '../components/ui';
import NotFound from './NotFound';
import Seo from '../components/Seo';
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
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => { setSelectedImage(gallery[0] || null); }, [slug, gallery[0]]);

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
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Products', path: '/products' },
            { name: product.name, path: `/products/${product.slug || slug}` },
          ]),
        ]}
      />

      {/* Dark breadcrumb band. Every other public page opens on blue-950; the
          navbar is fixed and transparent until scroll, so this page needs the
          same dark top or the white logo and nav links vanish against white. */}
      <section className="relative overflow-hidden bg-blue-950 text-white page-band">
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none mix-blend-screen transform -translate-y-1/2 translate-x-1/4" />

        <div className="relative container-page max-w-7xl flex items-center justify-between gap-4">
          <div className="text-xs text-slate-400 flex items-center gap-2 min-w-0">
            <Link to="/" className="hover:text-cyan-400 transition-colors">Home</Link>
            <span className="text-slate-600">/</span>
            <Link to="/products" className="hover:text-cyan-400 transition-colors">Products</Link>
            <span className="text-slate-600">/</span>
            <span className="font-semibold text-white truncate">{product.name}</span>
          </div>
          <button
            onClick={() => navigate('/products')}
            className="text-xs font-semibold text-slate-300 hover:text-cyan-400 flex items-center gap-1 shrink-0 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Products</span>
          </button>
        </div>
      </section>

      <div className="container-page max-w-7xl space-y-12 py-12">

        {/* GALLERY + INFO */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden p-6 lg:p-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

            <div className="lg:col-span-7 space-y-4">
              <div className="relative h-80 sm:h-96 bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 group">
                {selectedImage ? (
                  <img
                    key={selectedImage}
                    src={selectedImage}
                    alt={product.name}
                    className="w-full h-full object-contain p-6 group-hover:scale-105 transition-transform duration-500 animate-fade-in"
                    fetchPriority="high"
                    decoding="async"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-sm text-slate-400">
                    Photo coming soon
                  </div>
                )}
                {product.badge && (
                  <span className="absolute top-4 left-4 bg-cyan-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow">
                    {product.badge}
                  </span>
                )}
              </div>

              {gallery.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {gallery.map((img, idx) => (
                    <button
                      key={`${img}-${idx}`}
                      onClick={() => setSelectedImage(img)}
                      className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all shrink-0 bg-slate-50 ${
                        selectedImage === img ? 'border-cyan-600 scale-95 shadow-md' : 'border-slate-200 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt={`${product.name} — view ${idx + 1}`} className="w-full h-full object-contain p-1" loading="lazy" decoding="async" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="lg:col-span-5 space-y-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  {(product.series || product.category) && (
                    <span className="text-xs font-bold text-cyan-700 uppercase tracking-widest bg-cyan-50 border border-cyan-100 px-2.5 py-1 rounded-full">
                      {product.series || product.category}
                    </span>
                  )}
                  <span className="text-xs text-slate-400 font-medium">
                    Model Code: CD-{String(product.slug).toUpperCase()}
                  </span>
                </div>

                <h1 className="text-3xl sm:text-4xl tracking-tighter font-medium leading-[1.1] text-slate-900">
                  {product.name}
                </h1>

                {product.tagline && <p className="text-cyan-700 font-semibold text-base mt-2">{product.tagline}</p>}

                <p className="text-slate-600 text-sm mt-4 leading-relaxed">{product.description}</p>

                {features.length > 0 && (
                  <div className="mt-6 space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                    <div className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                      Key features &amp; inclusions
                    </div>
                    {features.map((feat, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-slate-700">
                        <CheckCircle2 className="w-4 h-4 text-cyan-600 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-3 pt-4 border-t border-slate-100">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={() => onOpenQuoteModal && onOpenQuoteModal(product.name)}
                    className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 pl-4 pr-2 rounded-full shadow-lg shadow-cyan-600/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                  >
                    <span>Request Quotation</span>
                    <ArrowRight className="w-8 h-8 bg-white/15 p-2 text-white rounded-full" />
                  </button>

                  <a
                    href={`https://wa.me/${COMPANY_DETAILS.whatsappNumber}?text=${encodeURIComponent(`Hello Care Dent, I am interested in ${product.name}.`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full bg-blue-950 hover:bg-blue-900 text-white font-bold py-3.5 px-4 rounded-full shadow flex items-center justify-center gap-2 transition-all text-xs"
                  >
                    <MessageSquare className="w-4 h-4 text-cyan-400" />
                    <span>WhatsApp Inquiry</span>
                  </a>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 pt-2">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4 text-cyan-600" /> Free installation included
                  </span>
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-4 h-4 text-cyan-600" /> 1-year full warranty
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SPECIFICATIONS */}
        {specs.length > 0 && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-lg p-6 lg:p-10 space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-2xl font-semibold text-slate-900">Technical specifications</h2>
              <p className="text-xs text-slate-500 mt-1">
                Manufacturer specification chart for {product.name}
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <tbody>
                  {specs.map((spec, idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? 'bg-slate-50/70' : 'bg-white'}>
                      <td className="py-3.5 px-4 text-xs font-bold text-slate-700 w-1/3 border-b border-slate-100">
                        {spec.label}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-800 font-medium border-b border-slate-100">
                        {spec.value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* INSTALLATION REQUIREMENTS */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-lg p-6 lg:p-10 space-y-8">
          <div className="border-b border-slate-100 pb-4 flex items-start gap-4">
            <div className="w-11 h-11 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center shrink-0">
              <Ruler className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">Installation requirements</h2>
              <p className="text-xs text-slate-500 mt-1">
                What the room needs before {product.name} can be installed. Figures are typical — the site
                assessment confirms them against your clinic.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
            {installRequirements.map((requirement) => (
              <div key={requirement} className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 shrink-0 mt-2" />
                <span className="text-sm text-slate-600 leading-relaxed">{requirement}</span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button
              onClick={() => downloadPreInstallationPdf(product)}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold text-xs px-6 py-3.5 rounded-full flex items-center justify-center gap-2 transition-colors active:scale-[0.98]"
            >
              <Download className="w-4 h-4 text-cyan-600" />
              <span>Download pre-installation PDF</span>
            </button>

            <Link
              to={`/services/pre-installation?equipment=${encodeURIComponent(product.name)}#request-assessment`}
              className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs px-6 py-3.5 rounded-full shadow-lg shadow-cyan-600/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            >
              <ClipboardCheck className="w-4 h-4" />
              <span>Request site assessment</span>
            </Link>
          </div>

          <p className="text-xs text-slate-400 flex items-center gap-1.5">
            <span>Full checklist, including optional Vastu layout guidance:</span>
            <Link to="/services/pre-installation" className="font-semibold text-cyan-700 hover:text-cyan-800 transition-colors">
              Pre-installation requirements →
            </Link>
          </p>
        </div>

        {/* BROCHURE */}
        <div className="bg-blue-950 text-white rounded-3xl p-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="flex items-center gap-2 justify-center md:justify-start">
              <FileText className="w-5 h-5 text-cyan-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-300">Technical datasheet</span>
            </div>
            <h3 className="text-xl font-semibold">{product.name} specification sheet</h3>
            <p className="text-xs text-slate-300">
              {hasBrochure
                ? 'Includes dimension drawings, utility pipeline specs and colour options.'
                : 'Not published online yet — request it and we will email it to you the same day.'}
            </p>
          </div>

          {hasBrochure ? (
            <a
              href={product.brochureUrl}
              target="_blank"
              rel="noreferrer"
              className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs px-6 py-3 rounded-full shadow-lg flex items-center gap-2 shrink-0"
            >
              <Download className="w-4 h-4" />
              <span>Download brochure PDF</span>
            </a>
          ) : (
            <a
              href={`mailto:${COMPANY_DETAILS.email}?subject=${encodeURIComponent(`Datasheet request: ${product.name}`)}`}
              className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs px-6 py-3 rounded-full shadow-lg flex items-center gap-2 shrink-0"
            >
              <FileText className="w-4 h-4" />
              <span>Request the datasheet</span>
            </a>
          )}
        </div>

        {/* RELATED */}
        {related.length > 0 && (
          <div className="space-y-6">
            <h3 className="text-2xl font-semibold text-slate-900">Explore related models</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {related.slice(0, 3).map((rc) => (
                <Link
                  key={rc.slug}
                  to={`/products/${rc.slug}`}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md hover:border-cyan-500 transition-all group"
                >
                  <img
                    src={rc.heroImage}
                    alt={rc.name}
                    loading="lazy"
                    className="w-full h-40 object-contain bg-slate-50 rounded-xl mb-4 p-2 group-hover:scale-105 transition-transform"
                  />
                  <div className="text-xs text-cyan-700 font-semibold uppercase tracking-widest">
                    {rc.series || rc.category}
                  </div>
                  <h4 className="text-base font-medium text-slate-900 mt-1 group-hover:text-cyan-600">{rc.name}</h4>
                  {rc.tagline && <p className="text-xs text-slate-500 mt-1 line-clamp-1">{rc.tagline}</p>}
                </Link>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
