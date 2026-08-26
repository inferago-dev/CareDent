import { Link } from 'react-router-dom';
import { ArrowUpRight, Ruler, Wrench, ShieldCheck, Zap, Phone, ClipboardCheck } from 'lucide-react';
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
    <section className="relative z-6 section-y bg-white overflow-hidden">
      <div ref={parallaxRef} className="container-page max-w-7xl will-change-transform w-full">

        {/* Label */}
        <Reveal>
          <span className="block text-xs uppercase tracking-widest text-slate-400 mb-10 font-medium">
            Services & Support
          </span>
        </Reveal>

        {/* Bento grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

          {/* LEFT COLUMN: service list tiles */}
          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-3">
            {SERVICES.map((s, idx) => {
              const Icon = ICONS[s.id];
              return (
                <Reveal key={s.id} delay={idx * 60}>
                  <Link
                    to={s.to}
                    className="group relative flex flex-col justify-between h-full min-h-[160px] rounded-2xl bg-slate-200 hover:bg-slate-300/50 transition-all duration-300 p-5 overflow-hidden"
                  >
                    {/* large faded index */}
                    <span className="absolute -bottom-3 -right-1 text-[5rem] font-bold text-slate-400/20 group-hover:text-slate-400/60 leading-none select-none transition-colors duration-300 pointer-events-none">
                      {String(idx + 1).padStart(2, '0')}
                    </span>

                    {/* icon */}
                    <div className="w-12 h-12 rounded-xl bg-white/60 flex items-center justify-center text-blue-950 group-hover:bg-blue-950 group-hover:text-white transition-all duration-300">
                      <Icon className="w-6 h-6" />
                    </div>

                    {/* text */}
                    <div className="mt-auto relative z-10">
                      <p className="text-lg font-medium text-slate-900 tracking-tighter leading-snug">{s.label}</p>
                      <p className="text-sm text-slate-500 mt-1 leading-tight">{s.desc}</p>
                    </div>
                  </Link>
                </Reveal>
              );
            })}
          </div>

          {/* RIGHT COLUMN: large statement + CTA */}
          <Reveal delay={80} className="lg:col-span-5">
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

              {/* Large statement text */}
              <div className="relative z-10">
                <p className="text-xs uppercase tracking-widest text-cyan-400 font-medium mb-6">
                  Care Dent Promise
                </p>
                <h2 className="text-4xl sm:text-5xl font-medium tracking-tighter leading-[1.05]">
                  We show up.{' '}<br />
                  <span className="text-white/30">Every call.<br />Every repair.<br />Every time.</span>
                </h2>
              </div>

              {/* Stats row */}
              <div className="relative z-10 mt-10 grid grid-cols-2 gap-4 border-t border-white/10 pt-8">
                <div>
                  <p className="text-3xl font-medium tracking-tighter">30+</p>
                  <p className="text-xs text-white/40 uppercase tracking-wide mt-1">Years of experience</p>
                </div>
                <div>
                  <p className="text-3xl font-medium tracking-tighter">6</p>
                  <p className="text-xs text-white/40 uppercase tracking-wide mt-1">Service categories</p>
                </div>
              </div>

              {/* CTAs */}
              <div className="relative z-10 mt-8 flex flex-col sm:flex-row gap-3">
                <Link
                  to="/services"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-white text-blue-950 text-sm font-semibold px-5 py-2.5 hover:bg-cyan-50 transition-colors"
                >
                  View All Services
                  <ArrowUpRight className="w-4 h-4" />
                </Link>

                <a
                  href={`https://wa.me/${COMPANY_DETAILS.whatsappNumber}?text=${encodeURIComponent('Hi Care Dent, I need technical support.')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 text-white text-sm font-medium px-5 py-2.5 hover:bg-white/10 transition-colors"
                >
                  WhatsApp Us
                </a>
              </div>
            </div>
          </Reveal>

        </div>
      </div>
    </section>
  );
}