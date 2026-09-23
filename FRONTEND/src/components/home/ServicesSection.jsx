import { Link } from 'react-router-dom';
import { ArrowUpRight, Ruler, Wrench, ShieldCheck, Zap, Phone, ClipboardCheck } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import { COMPANY_DETAILS } from '../../data/products';
import Reveal from '../Reveal';
import useParallax from '../../hooks/useParallax';

const ICONS = {
  'pre-installation': Ruler,
  installation: Wrench,
  maintenance: ShieldCheck,
  repair: Zap,
  support: Phone,
  inspection: ClipboardCheck,
};

const SERVICES = [
  { id: 'pre-installation', label: 'Pre-Installation', desc: 'Free site survey before you buy.', to: '/services/pre-installation' },
  { id: 'installation', label: 'Installation', desc: 'Certified precision setup by engineers.', to: '/services' },
  { id: 'maintenance', label: 'Maintenance', desc: 'Scheduled preventive service visits.', to: '/services' },
  { id: 'repair', label: 'Repair', desc: 'Rapid fault response, all types.', to: '/services' },
  { id: 'support', label: 'Support', desc: 'Direct access to our experts.', to: '/services' },
  { id: 'inspection', label: 'Inspection', desc: 'Pre-purchase safety audits.', to: '/services' },
];

export default function ServicesSection() {
  const parallaxRef = useParallax(0.04);

  return (
    <section className="relative section-y bg-white overflow-hidden">
      <div ref={parallaxRef} className="container-page max-w-7xl will-change-transform w-full">

        {/* Label + section heading */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-10">
          <div>
            <Reveal>
              <span className="block text-xs uppercase tracking-widest text-cyan-600 mb-4 font-bold">
                Services &amp; Support
              </span>
            </Reveal>
            <Reveal delay={80} variant="blur">
              <h2 className="text-3xl sm:text-4xl font-medium tracking-tighter text-blue-950 leading-[1.1]">
                Everything you need, under one roof.
              </h2>
            </Reveal>
          </div>
          <Reveal delay={140}>
            <p className="text-slate-500 leading-relaxed max-w-sm">
              From the first site survey to the call you make years later, one team looks after your equipment.
            </p>
          </Reveal>
        </div>

        {/* Bento grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

          {/* LEFT COLUMN: service list tiles */}
          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-4">
            {SERVICES.map((s, idx) => {
              const Icon = ICONS[s.id];
              return (
                <Reveal key={s.id} delay={idx * 70} variant="scale" scale={0.97}>
                  <Link
                    to={s.to}
                    className="group flex flex-col h-full min-h-[190px] rounded-2xl bg-white border border-slate-200 p-5 hover:border-cyan-200 hover:shadow-xl hover:shadow-cyan-900/5 transition-all duration-500"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="w-11 h-11 rounded-xl bg-slate-50 border border-slate-200 text-blue-950 flex items-center justify-center group-hover:bg-blue-950 group-hover:border-blue-950 group-hover:text-white transition-colors duration-500">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-medium text-slate-300 tracking-widest pt-1">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                    </div>

                    <div className="mt-auto pt-6">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-lg font-medium tracking-tight text-slate-900">{s.label}</h3>
                        <ArrowUpRight className="w-4 h-4 shrink-0 text-slate-300 group-hover:text-cyan-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300" />
                      </div>
                      <p className="text-sm text-slate-500 mt-1 leading-snug">{s.desc}</p>
                    </div>
                  </Link>
                </Reveal>
              );
            })}
          </div>

          {/* RIGHT COLUMN: large statement + CTA */}
          <Reveal delay={80} variant="right" x={40} className="lg:col-span-5">
            <div className="relative h-full flex flex-col justify-between bg-blue-950 rounded-3xl p-8 sm:p-10 text-white overflow-hidden">

              {/* Concentric circles pattern */}
              <svg
                className="absolute -right-48 -top-48 w-[540px] h-[540px] pointer-events-none"
                viewBox="0 0 600 600"
                fill="none"
              >
                {[50, 95, 140, 185, 230, 275, 320].map((r, i) => (
                  <circle
                    key={r}
                    cx="300"
                    cy="300"
                    r={r}
                    stroke="white"
                    strokeOpacity={0.1 - i * 0.007}
                    strokeWidth="1"
                  />
                ))}
              </svg>

              {/* Glassmorphism blur glow — same as the CTA panel */}
              <div className="absolute inset-x-0 bottom-0 h-40 pointer-events-none">
                <div className="absolute -bottom-16 left-1/4 w-72 h-72 bg-cyan-500/20 rounded-full blur-3xl" />
                <div className="absolute -bottom-20 right-0 w-72 h-72 bg-blue-400/15 rounded-full blur-3xl" />
              </div>

              {/* Large statement text */}
              <div className="relative z-10">
                <Reveal delay={120}>
                  <p className="text-xs uppercase tracking-widest text-cyan-400 font-bold mb-6">
                    Care Dent Promise
                  </p>
                </Reveal>
                <Reveal delay={200} variant="blur">
                  <h2 className="text-4xl sm:text-5xl font-medium tracking-tighter leading-[1.05]">
                    We show up.{' '}<br />
                    <span className="text-white/30">Every call.<br />Every repair.<br />Every time.</span>
                  </h2>
                </Reveal>
              </div>

              {/* Stats row */}
              <div className="relative z-10 mt-10 grid grid-cols-2 gap-4 border-t border-white/10 pt-8">
                <Reveal delay={320} y={16}>
                  <div>
                    <p className="text-3xl font-medium tracking-tighter">30+</p>
                    <p className="text-xs text-slate-400 uppercase tracking-widest mt-1">Years of experience</p>
                  </div>
                </Reveal>
                <Reveal delay={400} y={16}>
                  <div>
                    <p className="text-3xl font-medium tracking-tighter">6</p>
                    <p className="text-xs text-slate-400 uppercase tracking-widest mt-1">Service categories</p>
                  </div>
                </Reveal>
              </div>

              {/* CTAs */}
              <Reveal delay={480} y={12}>
                <div className="relative z-10 mt-8 flex flex-col sm:flex-row gap-3">
                  <Link
                    to="/services"
                    className="group inline-flex items-center justify-between gap-3 rounded-full bg-white text-blue-950 font-medium text-sm py-1.5 pl-6 pr-1.5 hover:bg-cyan-50 transition-all active:scale-[0.98]"
                  >
                    View All Services
                    <span className="w-8 h-8 rounded-full bg-blue-950 text-white flex items-center justify-center">
                      <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </span>
                  </Link>

                  <a
                    href={`https://wa.me/${COMPANY_DETAILS.whatsappNumber}?text=${encodeURIComponent('Hi Care Dent, I need technical support.')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-full backdrop-blur-xl bg-white/5 border border-white/15 text-white font-medium text-sm px-6 py-3 hover:bg-white/10 transition-all active:scale-[0.98]"
                  >
                    <FaWhatsapp className="w-4 h-4" />
                    WhatsApp Us
                  </a>
                </div>
              </Reveal>
            </div>
          </Reveal>

        </div>
      </div>
    </section>
  );
}