import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Ruler, Zap, Droplets, Wind, LayoutGrid, Building2, Thermometer, Compass,
  Truck, Download, ArrowRight, CheckCircle2, Info, Phone, ChevronDown,
} from 'lucide-react';
import {
  PRE_INSTALL_SECTIONS, SITE_READINESS_CHECKLIST, ASSESSMENT_STEPS,
} from '../data/preInstallation';
import { COMPANY_DETAILS } from '../data/products';
import Reveal from '../components/Reveal';
import SiteAssessmentForm from '../components/SiteAssessmentForm';
import downloadPreInstallationPdf from '../lib/preInstallationPdf';
import Seo from '../components/Seo';
import { breadcrumbSchema } from '../lib/seo';
import { metaFor } from '../lib/pageMeta';

const ICONS = {
  Ruler, Zap, Droplets, Wind, LayoutGrid, Building2, Thermometer, Compass, Truck,
};

/** One requirement group. Open by default on desktop, collapsible on mobile. */
function SectionCard({ section, index }) {
  const [open, setOpen] = useState(false);
  const Icon = ICONS[section.iconName] || Ruler;

  return (
    <div
      className={`h-full rounded-2xl border p-6 sm:p-7 transition-all duration-500 ${
        section.optional
          ? 'border-dashed border-cyan-200 bg-cyan-50/40'
          : 'border-slate-200 bg-white hover:border-cyan-200 hover:shadow-xl hover:shadow-cyan-900/5'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4 min-w-0">
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
              section.optional ? 'bg-white text-cyan-600 border border-cyan-200' : 'bg-cyan-50 text-cyan-600'
            }`}
          >
            <Icon className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-slate-300 tracking-widest">
                {String(index + 1).padStart(2, '0')}
              </span>
              {section.optional && (
                <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-700 bg-cyan-100 px-2 py-0.5 rounded-full">
                  Optional
                </span>
              )}
            </div>
            <h3 className="text-lg font-medium text-slate-900 leading-snug mt-0.5">{section.title}</h3>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="sm:hidden p-1 text-slate-400 shrink-0"
          aria-label={`Toggle ${section.title}`}
        >
          <ChevronDown className={`w-5 h-5 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {section.summary && (
        <p className="text-sm text-slate-500 leading-relaxed mt-4">{section.summary}</p>
      )}

      <ul className={`mt-4 space-y-2 ${open ? 'block' : 'hidden'} sm:block`}>
        {section.items.map((item) => (
          <li key={item} className="flex items-start gap-2.5 text-sm text-slate-600">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 shrink-0 mt-[7px]" />
            <span className="leading-relaxed">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function PreInstallation({ onOpenQuoteModal }) {
  const [params] = useSearchParams();
  const equipment = params.get('equipment') || '';
  const [ticked, setTicked] = useState(() => new Set());

  const toggle = (item) =>
    setTicked((current) => {
      const next = new Set(current);
      if (next.has(item)) next.delete(item);
      else next.add(item);
      return next;
    });

  const ready = ticked.size === SITE_READINESS_CHECKLIST.length;

  return (
    <div className="min-h-screen bg-white text-slate-800">
      <Seo
        {...metaFor('/services/pre-installation')}
        schema={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Services', path: '/services' },
          { name: 'Pre-Installation', path: '/services/pre-installation' },
        ])}
      />

      {/* HEADER */}
      <section className="relative overflow-hidden bg-blue-950 text-white py-24 sm:py-32">
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none mix-blend-screen transform -translate-y-1/2 translate-x-1/4" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Reveal>
            <div className="text-xs text-slate-400 flex items-center justify-center gap-2 mb-6">
              <Link to="/services" className="hover:text-cyan-400 transition-colors">Services</Link>
              <span className="text-slate-600">/</span>
              <span className="text-slate-200">Pre-Installation</span>
            </div>
            <span className="block text-xs uppercase tracking-widest text-cyan-400 mb-6 font-bold">
              Pre-Installation & Site Readiness
            </span>
            <h1 className="text-4xl sm:text-5xl tracking-tighter font-medium leading-[1.1]">
              Get the room right, and installation day is boring
            </h1>
          </Reveal>
          <Reveal delay={100}>
            <p className="text-slate-400 text-base leading-relaxed max-w-2xl mx-auto mt-6">
              Most delayed installations are not equipment problems — they are a missing earth pin, a drain
              on the wrong wall, or a doorway 40 mm too narrow. Here is exactly what your site needs, and a
              free assessment to check it before you commit to a date.
            </p>
          </Reveal>
          <Reveal delay={180}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-9">
              <button
                onClick={() => downloadPreInstallationPdf()}
                className="inline-flex items-center gap-2 rounded-full bg-white text-blue-950 text-sm font-semibold px-6 py-3 hover:bg-cyan-50 transition-colors active:scale-[0.98]"
              >
                <Download className="w-4 h-4" />
                <span>Download the checklist PDF</span>
              </button>
              <a
                href="#request-assessment"
                className="inline-flex items-center gap-2 rounded-full border border-white/20 text-white text-sm font-medium px-6 py-3 hover:bg-white/10 transition-colors"
              >
                <span>Request a site assessment</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-20 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal>
            <span className="block text-xs uppercase tracking-widest text-slate-400 mb-10 font-medium">
              How the assessment works
            </span>
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {ASSESSMENT_STEPS.map((step, idx) => (
              <Reveal key={step.title} delay={idx * 80}>
                <div className="h-full rounded-2xl bg-slate-50 border border-slate-100 p-6">
                  <div className="text-3xl font-medium tracking-tighter text-cyan-600/30">
                    {String(idx + 1).padStart(2, '0')}
                  </div>
                  <h3 className="text-base font-medium text-slate-900 mt-3">{step.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed mt-1.5">{step.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* REQUIREMENTS */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="max-w-2xl mb-12">
              <span className="block text-xs uppercase tracking-widest text-cyan-600 mb-3 font-bold">
                What your site needs
              </span>
              <h2 className="text-3xl sm:text-4xl tracking-tighter font-medium text-slate-900 leading-[1.15]">
                Nine things to settle before the chair arrives
              </h2>
              <p className="text-slate-500 text-base mt-4 leading-relaxed">
                Share this with your civil, electrical and plumbing contractors. Anything you cannot answer
                yet, leave it — that is what the site visit is for.
              </p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {PRE_INSTALL_SECTIONS.map((section, idx) => (
              <Reveal key={section.id} delay={(idx % 3) * 80} y={24}>
                <SectionCard section={section} index={idx} />
              </Reveal>
            ))}
          </div>

          <Reveal delay={120}>
            <div className="mt-8 flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4">
              <Info className="w-4 h-4 text-cyan-600 shrink-0 mt-0.5" />
              <p className="text-sm text-slate-600 leading-relaxed">
                Exact figures depend on the model you choose — a compact chair and a full overhanging unit
                do not need the same clearance. Every product page carries its own installation requirements,
                and the assessment confirms them against your room.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* SITE-READINESS CHECKLIST */}
      <section className="py-24 bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

            <Reveal className="lg:col-span-5">
              <span className="block text-xs uppercase tracking-widest text-cyan-600 mb-3 font-bold">
                Site-readiness checklist
              </span>
              <h2 className="text-3xl sm:text-4xl tracking-tighter font-medium text-slate-900 leading-[1.15]">
                Ten ticks between you and an installation date
              </h2>
              <p className="text-slate-500 text-base mt-4 leading-relaxed">
                Tick them off as your contractors finish. When all ten are green, call us and we will lock
                the date — the whole install typically finishes in a single day.
              </p>

              <div className="mt-8 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-1.5 flex-1 rounded-full bg-slate-200 overflow-hidden">
                    <div
                      className="h-full bg-cyan-500 rounded-full transition-all duration-500"
                      style={{ width: `${(ticked.size / SITE_READINESS_CHECKLIST.length) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-slate-500 tabular-nums shrink-0">
                    {ticked.size}/{SITE_READINESS_CHECKLIST.length}
                  </span>
                </div>
                {ready && (
                  <p className="text-sm font-medium text-cyan-700 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Site is ready — request your installation date below.
                  </p>
                )}
              </div>

              <button
                onClick={() => downloadPreInstallationPdf()}
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-blue-950 text-white text-sm font-semibold px-6 py-3 hover:bg-blue-900 transition-colors active:scale-[0.98]"
              >
                <Download className="w-4 h-4 text-cyan-400" />
                <span>Download as a printable PDF</span>
              </button>
            </Reveal>

            <Reveal delay={120} className="lg:col-span-7">
              <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-8">
                <ul className="divide-y divide-slate-100">
                  {SITE_READINESS_CHECKLIST.map((item) => {
                    const checked = ticked.has(item);
                    return (
                      <li key={item}>
                        <label className="flex items-center gap-3 py-3.5 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggle(item)}
                            className="peer sr-only"
                          />
                          <span
                            className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${
                              checked
                                ? 'bg-cyan-600 border-cyan-600 text-white'
                                : 'border-slate-300 group-hover:border-cyan-400'
                            }`}
                          >
                            {checked && <CheckCircle2 className="w-3.5 h-3.5" />}
                          </span>
                          <span
                            className={`text-sm transition-colors ${
                              checked ? 'text-slate-400 line-through' : 'text-slate-700'
                            }`}
                          >
                            {item}
                          </span>
                        </label>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </Reveal>

          </div>
        </div>
      </section>

      {/* REQUEST ASSESSMENT */}
      <section id="request-assessment" className="py-24 scroll-mt-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="text-center mb-10">
              <span className="block text-xs uppercase tracking-widest text-cyan-600 mb-3 font-bold">
                Free · No obligation
              </span>
              <h2 className="text-3xl sm:text-4xl tracking-tighter font-medium text-slate-900">
                Request a pre-installation assessment
              </h2>
              <p className="text-slate-500 text-base mt-3 max-w-xl mx-auto">
                Send your room dimensions and a floor plan or a couple of photos. You will get a reference
                number straight away, and an engineer will call to walk through the layout.
              </p>
            </div>
          </Reveal>
          <Reveal delay={100}>
            <SiteAssessmentForm initialEquipment={equipment} />
          </Reveal>
        </div>
      </section>

      {/* CLOSING CTA */}
      <section className="pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="rounded-3xl bg-blue-950 text-white p-10 sm:p-14 flex flex-col lg:flex-row items-center justify-between gap-8">
              <div className="space-y-3 text-center lg:text-left">
                <h2 className="text-2xl sm:text-3xl tracking-tighter font-medium leading-snug">
                  Not sure the room will take the chair you want?
                </h2>
                <p className="text-slate-400 text-sm leading-relaxed max-w-xl">
                  Send us the plan before you order. {COMPANY_DETAILS.founder} has fitted chairs into
                  {' '}{COMPANY_DETAILS.experienceYears} years of awkward rooms — it is usually solvable.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 shrink-0">
                <a
                  href={`tel:${COMPANY_DETAILS.phoneNumbers[0]}`}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-semibold px-6 py-3 transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  <span>{COMPANY_DETAILS.phoneNumbers[0]}</span>
                </a>
                <button
                  onClick={() => onOpenQuoteModal && onOpenQuoteModal()}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 text-white text-sm font-medium px-6 py-3 hover:bg-white/10 transition-colors"
                >
                  <span>Request a quote</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

    </div>
  );
}
