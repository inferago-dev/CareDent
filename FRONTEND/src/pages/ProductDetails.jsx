import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  CheckCircle2, Download, MessageSquare, ArrowRight, ShieldCheck, 
  Sparkles, FileText, Share2, Stethoscope, ChevronLeft 
} from 'lucide-react';
import { DENTAL_CHAIRS, COMPANY_DETAILS } from '../data/products';

export default function ProductDetails({ onOpenQuoteModal }) {
  const { slug } = useParams();
  const navigate = useNavigate();

  const chair = DENTAL_CHAIRS.find(c => c.slug === slug) || DENTAL_CHAIRS[0];
  const [selectedImage, setSelectedImage] = useState(chair.images[0] || chair.heroImage);

  const relatedChairs = DENTAL_CHAIRS.filter(c => c.slug !== chair.slug);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Top Navigation & Breadcrumbs */}
        <div className="flex items-center justify-between">
          <div className="text-xs text-slate-500 flex items-center gap-2">
            <Link to="/" className="hover:text-cyan-600">Home</Link>
            <span>/</span>
            <Link to="/products" className="hover:text-cyan-600">Products</Link>
            <span>/</span>
            <span className="font-semibold text-slate-800">{chair.name}</span>
          </div>

          <button
            onClick={() => navigate('/products')}
            className="text-xs font-semibold text-slate-600 hover:text-cyan-600 flex items-center gap-1"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to Products</span>
          </button>
        </div>

        {/* HERO GALLERY & PRIMARY PRODUCT INFO */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden p-6 lg:p-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            
            {/* Gallery Column (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="relative h-80 sm:h-96 bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 group">
                <img
                  key={selectedImage}
                  src={selectedImage}
                  alt={chair.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 animate-fade-in"
                />
                <span className="absolute top-4 left-4 bg-cyan-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow">
                  {chair.badge}
                </span>
              </div>

              {/* Thumbnails */}
              <div className="flex gap-3 overflow-x-auto pb-2">
                {chair.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                      selectedImage === img ? 'border-cyan-600 scale-95 shadow-md' : 'border-slate-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Info Column (5 cols) */}
            <div className="lg:col-span-5 space-y-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold text-cyan-600 uppercase tracking-widest bg-cyan-50 px-2.5 py-0.5 rounded-full">
                    {chair.series}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">Model Code: CD-{chair.id.toUpperCase()}</span>
                </div>

                <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                  {chair.name}
                </h1>

                <p className="text-cyan-700 font-semibold text-base mt-2">
                  {chair.tagline}
                </p>

                <p className="text-slate-600 text-sm mt-4 leading-relaxed">
                  {chair.description}
                </p>

                {/* Key Differentiators */}
                <div className="mt-6 space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <div className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                    Key Features & Inclusions:
                  </div>
                  {chair.keyDifferentiators.map((feat, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-cyan-600 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={() => onOpenQuoteModal(chair.name)}
                    className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-cyan-600/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                  >
                    <span>Request Quotation</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <a
                    href={`https://wa.me/${COMPANY_DETAILS.whatsappNumber}?text=${encodeURIComponent(`Hello Care Dent, I am interested in inquiring about ${chair.name} Chair.`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 px-4 rounded-xl shadow flex items-center justify-center gap-2 transition-all text-xs"
                  >
                    <MessageSquare className="w-4 h-4 text-cyan-400" />
                    <span>WhatsApp Inquiry</span>
                  </a>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 pt-2">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4 text-cyan-600" /> Free Installation Included
                  </span>
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-4 h-4 text-cyan-600" /> 1-Year Full Warranty
                  </span>
                </div>
              </div>

            </div>

          </div>
        </div>

        {/* DETAILED SPECIFICATIONS TABLE */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-lg p-6 lg:p-10 space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-2xl font-bold text-slate-900">Technical Specifications</h2>
            <p className="text-xs text-slate-500 mt-1">Official manufacturer specification chart for {chair.name}</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <tbody>
                {chair.specifications.map((spec, idx) => (
                  <tr
                    key={idx}
                    className={idx % 2 === 0 ? 'bg-slate-50/70' : 'bg-white'}
                  >
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

        {/* DOWNLOAD BROCHURE */}
        <div className="bg-blue-950 text-white rounded-3xl p-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="flex items-center gap-2 justify-center md:justify-start">
              <FileText className="w-5 h-5 text-cyan-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-300">Brochure Download</span>
            </div>
            <h3 className="text-xl font-bold">Download {chair.name} Technical Datasheet</h3>
            <p className="text-xs text-slate-300">Includes dimension drawings, utility pipeline specs, and color options.</p>
          </div>
          <button
            onClick={() => alert(`Downloading technical brochure PDF for ${chair.name}...`)}
            className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-lg flex items-center gap-2 shrink-0"
          >
            <Download className="w-4 h-4" />
            <span>Download Brochure PDF</span>
          </button>
        </div>

        {/* RELATED PRODUCTS */}
        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-slate-900">Explore Related Models</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {relatedChairs.slice(0, 3).map((rc) => (
              <Link
                key={rc.id}
                to={`/products/${rc.slug}`}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md hover:border-cyan-500 transition-all group"
              >
                <img src={rc.heroImage} alt={rc.name} className="w-full h-40 object-cover rounded-xl mb-4 group-hover:scale-105 transition-transform" />
                <div className="text-xs text-cyan-600 font-bold uppercase">{rc.series}</div>
                <h4 className="text-base font-bold text-slate-900 mt-1 group-hover:text-cyan-600">{rc.name}</h4>
                <p className="text-xs text-slate-500 mt-1 line-clamp-1">{rc.tagline}</p>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
