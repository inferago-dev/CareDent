import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Wrench, Award, Phone } from 'lucide-react';
import { COMPANY_DETAILS } from '../data/products';
import useParallax from '../hooks/useParallax';

export default function Hero({ onOpenQuoteModal }) {
  const [isBlurVisible, setIsBlurVisible] = useState(true);
  const parallaxRef = useParallax(0.08);
  useEffect(() => {
    const footer = document.querySelector('footer');
    if (!footer) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsBlurVisible(!entry.isIntersecting);
      },
      { root: null, threshold: 0.1 }
    );
    observer.observe(footer);
    return () => observer.disconnect();
  }, []);
  return (
    <section className="relative z-1 overflow-hidden text-white bg-blue-950 pt-28 pb-10 lg:pt-16 lg:pb-0 lg:h-screen lg:flex lg:items-center">
      {/* Concentric circles pattern */}
      <svg
        className={`absolute -right-72 top-1/2 -translate-y-1/2 w-[600px] h-[600px] sm:w-[1200px] sm:h-[1200px] pointer-events-none transition-opacity duration-500 mask-[linear-gradient(to_right,transparent,black_40%)] ${isBlurVisible ? 'opacity-100' : 'opacity-0'}`}
        viewBox="0 0 800 800"
        fill="none"
      >
        {[100, 140, 180, 220, 260, 300, 340, 380, 420, 460, 500, 540, 580, 620, 660, 700, 740, 780, 820].map((r, i) => (
          <circle
            key={r}
            cx="400"
            cy="400"
            r={r}
            stroke="white"
            strokeOpacity={0.12 - i * 0.01}
            strokeWidth="1"
          />
        ))}
      </svg>

      {/* Glassmorphism blur glow */}
      <div className={`absolute inset-x-0 bottom-0 h-64 pointer-events-none transition-opacity duration-500 ${isBlurVisible ? 'opacity-100' : 'opacity-0'}`}>
        <div className="absolute -bottom-16 right-0 w-[500px] h-[500px] bg-cyan-500/20 rounded-full blur-[100px]" />
        <div className="absolute -bottom-20 right-1/4 w-[600px] h-[600px] bg-blue-500/20 rounded-full blur-[100px]" />
        <div className="absolute inset-0 backdrop-blur-2xl mask-[linear-gradient(to_top,black,transparent)]" />
      </div>

      <div ref={parallaxRef} className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 will-change-transform w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-center">

          {/* Left Content */}
          <div className="lg:col-span-7 space-y-6">
            <span className="block text-xs uppercase tracking-widest text-slate-400">
              Dental Equipment &amp; Clinical Solutions
            </span>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl tracking-tighter font-medium">
              <span className="text-cyan-500 font-playfair italic">Dental chairs</span> that come with the engineers who service them.
            </h1>

            <p className="text-slate-400 text-base leading-tight tracking-tighter font-regular max-w-xl">
              We survey your room before you buy, install it ourselves, and pick up
              the phone when something goes wrong. Spares held in stock, so most
              repairs finish in a single visit.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                to="/products"
                className="inline-flex items-center gap-2 font-medium rounded-full tracking-tighter bg-white text-blue-950 hover:bg-blue-300 px-2 ps-5 py-2 transition-colors"
              >
                <span>Explore Products</span>
                <ArrowRight className="w-8 h-8 bg-blue-950 p-2 text-white rounded-full" />
              </Link>

              <button
                onClick={() => onOpenQuoteModal()}
                className="inline-flex items-center gap-2 rounded-full tracking-tighter hover:bg-white/5 border border-white/20 text-white px-6 py-3 transition-colors"
              >
                Request a Quote
              </button>
            </div>

            {/* Most enquiries for equipment at this price start as a phone call,
                so the number is a primary action rather than a footer detail. */}
            <a
              href={`tel:${COMPANY_DETAILS.phoneNumbers[0]}`}
              className="inline-flex items-center gap-2.5 text-sm text-slate-300 hover:text-cyan-400 transition-colors pt-1"
            >
              <Phone className="w-4 h-4 text-cyan-500" />
              <span>
                Or talk to {COMPANY_DETAILS.founder.replace('Mr. ', '')} directly —{' '}
                <span className="font-semibold text-white">{COMPANY_DETAILS.phoneNumbers[0]}</span>
              </span>
            </a>

          </div>

          {/* Right Image with Floating Stats */}
          <div className="lg:col-span-5 relative flex items-center justify-center min-h-[400px] lg:min-h-[600px] mt-10 lg:mt-0">
            <div className="relative w-full max-w-[400px] lg:max-w-[500px] aspect-square flex items-center justify-center">

              {/* Floating Card 1 (top-left, mirrors card 3 on the right) */}
              <div className="absolute -left-6 sm:-left-14 top-6 sm:top-2 z-20 backdrop-blur-xl bg-white/5 border border-white/10 p-1 px-2 sm:p-2 sm:pe-4 rounded-2xl flex items-center gap-3.5 hover:-translate-y-1 transition-transform cursor-default">
                <div className="bg-cyan-500/20 p-2.5 rounded-xl border border-cyan-500/20">
                  <ShieldCheck className="w-6 h-6 text-cyan-500" />
                </div>
                <div className="text-left">
                  <div className="text-white text-sm sm:text-md tracking-tight">30+ Yrs Exp.</div>
                  <div className="text-slate-400 text-xs tracking-tight">Mr. Sivakumar</div>
                </div>
              </div>

              {/* The Tooth Image */}
              <img
                src="/Tooth.png"
                alt="Care Dent Tooth"
                className="relative z-10 w-full h-full object-contain drop-shadow-[0_0_80px_rgba(34,211,238,0.15)] hover:scale-105 transition-transform duration-700 ease-out"
                fetchPriority="high"
                decoding="async"
              />

              {/* Floating Card 2 (bottom-right) */}
              <div className="absolute -right-6 sm:-right-10 bottom-16 z-20 backdrop-blur-xl bg-white/5 border border-white/10 p-1 px-2 sm:p-2 sm:pe-4 rounded-2xl flex items-center gap-3.5 hover:-translate-y-1 transition-transform cursor-default">
                <div className="bg-cyan-500/20 p-2.5 rounded-xl border border-cyan-500/20">
                  <Wrench className="w-6 h-6 text-cyan-500" />
                </div>
                <div className="text-left">
                  <div className="text-white text-sm sm:text-md tracking-tight">Site-Ready Installs</div>
                  <div className="text-slate-400 text-xs tracking-tight">Surveyed before delivery</div>
                </div>
              </div>

              {/* Floating Card 3 (top-right) */}
              <div className="absolute right-4 sm:right-12 -top-5 z-20 backdrop-blur-xl bg-white/5 border border-white/10 p-1 px-2 sm:p-2 sm:pe-4 rounded-2xl flex items-center gap-3.5 hover:-translate-y-1 transition-transform cursor-default">
                <div className="bg-cyan-500/20 p-2.5 rounded-xl border border-cyan-500/20">
                  <Award className="w-6 h-6 text-cyan-500" />
                </div>
                <div className="text-left">
                  <div className="text-white text-sm sm:text-md tracking-tight">Sales · Service</div>
                  <div className="text-slate-400 text-xs tracking-tight">Support, end to end</div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}