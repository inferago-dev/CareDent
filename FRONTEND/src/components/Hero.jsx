import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Wrench, Award } from 'lucide-react';

export default function Hero({ onOpenQuoteModal }) {
  return (
    <section className="relative text-white bg-blue-950 py-20 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">

          {/* Left Content */}
          <div className="lg:col-span-7 space-y-8">
            <span className="block text-xs uppercase tracking-widest text-slate-400">
              Dental Equipment &amp; Clinical Solutions
            </span>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl tracking-tighter font-medium">
              Premium <span className="text-cyan-500 font-playfair italic">dental chairs</span> installed and supported end to end.
            </h1>

            <p className="text-slate-400 text-base leading-relaxed max-w-xl">
              Engineered for clinician legroom, integrated optic scaling, and
              zero-downtime reliability — with certified installation and
              support delivered pan-India.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                to="/products"
                className="inline-flex items-center gap-2 rounded-full tracking-tight bg-white text-blue-950 hover:bg-blue-300 px-6 py-3 transition-colors"
              >
                <span>Explore Products</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <button
                onClick={() => onOpenQuoteModal()}
                className="inline-flex items-center gap-2 rounded-full tracking-tight hover:bg-white/5 border border-white/20 text-white px-6 py-3 transition-colors"
              >
                Request a Quote
              </button>
            </div>

            {/* Trust Row */}
            <div className="pt-10 border-t border-white/10 grid grid-cols-3 gap-6">
              <div className="flex items-start gap-3">
                <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <div className="text-white font-medium">30+ Yrs Exp.</div>
                  <div className="text-slate-500 mt-0.5">Mr. Sivakumar</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Wrench className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <div className="text-white font-medium">Expert AMC</div>
                  <div className="text-slate-500 mt-0.5">Pan-India support</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Award className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <div className="text-white font-medium">100% Quality</div>
                  <div className="text-slate-500 mt-0.5">German standards</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Image */}
          <div className="lg:col-span-5">
            <div className="relative aspect-[4/5] bg-white/5 border border-white/10 overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1000&q=80"
                alt="Dental chair in a modern clinic"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}