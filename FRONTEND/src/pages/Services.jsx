import React from 'react';
import {
  Wrench, ShieldCheck, Calendar, Activity, PhoneCall, ClipboardCheck,
  ArrowRight, CheckCircle2
} from 'lucide-react';
import { SERVICES_LIST, COMPANY_DETAILS } from '../data/products';
import Reveal from '../components/Reveal';

const ICONS = { Wrench, ShieldCheck, Calendar, Activity, PhoneCall, ClipboardCheck };

const AMC_INCLUSIONS = [
  'Scheduled preventive maintenance visits',
  'Free emergency breakdown call-outs',
  'Discounted genuine spare parts',
  'Direct technician hotline access'
];

export default function Services({ onOpenQuoteModal }) {
  return (
    <div className="min-h-screen bg-white text-slate-800">

      {/* HEADER */}
      <section className="relative overflow-hidden bg-blue-950 text-white py-24 sm:py-32">
        {/* Background glow effects */}
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none mix-blend-screen transform -translate-y-1/2 translate-x-1/4" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Reveal>
            <span className="block text-xs uppercase tracking-widest text-cyan-400 mb-6 font-bold">
              Services & AMC
            </span>
            <h1 className="text-4xl sm:text-5xl tracking-tighter font-medium leading-[1.1]">
              Technical support that outlasts the sale
            </h1>
          </Reveal>
          <Reveal delay={100}>
            <p className="text-slate-400 text-base leading-relaxed max-w-2xl mx-auto mt-6">
              Every chair we install is backed by certified engineers, transparent AMC plans, and a founder
              who still answers technical calls himself.
            </p>
          </Reveal>
        </div>
      </section>

      {/* SERVICES GRID */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {SERVICES_LIST.map((service, idx) => {
              const Icon = ICONS[service.iconName] || Wrench;
              return (
                <Reveal key={service.id} delay={idx * 80} y={24}>
                  <div className="group h-full bg-white border border-slate-200 rounded-2xl p-7 space-y-5 hover:border-cyan-200 hover:shadow-xl hover:shadow-cyan-900/5 transition-all duration-500">
                    <div className="flex items-center justify-between">
                      <div className="w-11 h-11 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center group-hover:bg-cyan-600 group-hover:text-white transition-colors duration-500">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-medium text-slate-300 tracking-widest">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-lg font-medium text-slate-900">{service.title}</h3>
                      <p className="text-sm text-slate-500 leading-relaxed">{service.description}</p>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* AMC HIGHLIGHT */}
      <section className="py-24 bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center bg-blue-950 rounded-3xl p-10 sm:p-14 text-white">
            <div className="lg:col-span-7 space-y-5">
              <Reveal>
                <span className="block text-xs uppercase tracking-widest text-slate-400 mb-2">
                  Annual Maintenance Contract
                </span>
                <h2 className="text-3xl sm:text-4xl tracking-tighter font-medium leading-[1.15]">
                  Zero downtime. One predictable yearly cost.
                </h2>
              </Reveal>
              <Reveal delay={100}>
                <p className="text-slate-400 leading-relaxed max-w-lg">
                  Our AMC plans cover scheduled preventive visits, free emergency call-outs, and discounted
                  spare parts — so a breakdown never becomes a lost patient day.
                </p>
              </Reveal>
              <Reveal delay={180}>
                <ul className="space-y-2.5 pt-2">
                  {AMC_INCLUSIONS.map((item) => (
                    <li key={item} className="flex items-center gap-2.5 text-sm text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </Reveal>
            </div>

            <Reveal delay={220} className="lg:col-span-5">
              <div className="bg-white/5 border border-white/15 rounded-2xl p-8 text-center space-y-5">
                <div className="text-xs uppercase tracking-widest text-slate-400">Get Started</div>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Talk to {COMPANY_DETAILS.founder} directly about an AMC plan tailored to your clinic.
                </p>
                <button
                  onClick={() => onOpenQuoteModal && onOpenQuoteModal()}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-sm px-6 py-3 transition-all active:scale-[0.98]"
                >
                  <span>Request AMC Quotation</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <a
                  href={`tel:${COMPANY_DETAILS.phoneNumbers[0]}`}
                  className="block text-xs text-slate-400 hover:text-cyan-400 transition-colors"
                >
                  or call {COMPANY_DETAILS.phoneNumbers[0]}
                </a>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

    </div>
  );
}
