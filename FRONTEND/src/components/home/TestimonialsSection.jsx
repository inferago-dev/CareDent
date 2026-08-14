import React from 'react';
import { ShieldCheck, Package, Wrench } from 'lucide-react';
import Reveal from '../Reveal';
import useParallax from '../../hooks/useParallax';
import { COMPANY_DETAILS } from '../../data/products';

/**
 * "Why Choose CARE DENT" — transcribed from the official product catalogue.
 *
 * This replaced a testimonial carousel that quoted three named doctors and
 * clinics who do not exist. Reference clinics are offered on request instead,
 * so nothing here claims an endorsement we cannot stand behind.
 */
const REASONS = [
  {
    icon: ShieldCheck,
    title: `${COMPANY_DETAILS.experienceYears} years of industry leadership`,
    body: `Guided by ${COMPANY_DETAILS.founder}'s deep industry expertise and a profound understanding of dental clinical needs, built across three decades at leading dental companies.`,
  },
  {
    icon: Package,
    title: 'Comprehensive portfolio',
    body: 'From advanced over-hanging dental chairs to portable X-ray units, autoclaves, compressors and clinical essentials — sourced from top-tier manufacturers.',
  },
  {
    icon: Wrench,
    title: 'Expert technical support',
    body: 'A dedicated team of service engineers ensuring flawless installation and rapid-response maintenance, so a breakdown never becomes a lost patient day.',
  },
];

export default function TestimonialsSection() {
  const parallaxRef = useParallax(0.05);

  return (
    <section className="relative z-4 py-24 bg-white overflow-hidden">
      <div ref={parallaxRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 will-change-transform w-full">

        <div className="max-w-2xl">
          <Reveal>
            <span className="block text-xs uppercase tracking-widest text-cyan-600 mb-4 font-bold">
              Why Care Dent
            </span>
          </Reveal>
          <Reveal delay={80} variant="blur">
            <h2 className="text-3xl sm:text-4xl tracking-tighter font-medium text-blue-950 leading-[1.1]">
              Bridging advanced technology and clinical practice
            </h2>
          </Reveal>
          <Reveal delay={140}>
            <p className="text-slate-500 mt-4 leading-relaxed">
              We don&apos;t just sell products. We offer complete, end-to-end technical support,
              precision installation and dependable maintenance — whether you are setting up a
              new practice or upgrading an existing one.
            </p>
          </Reveal>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-14">
          {REASONS.map((r, idx) => {
            const Icon = r.icon;
            return (
              <Reveal key={r.title} delay={idx * 110} variant="scale">
                <div className="group h-full bg-white border border-slate-200 rounded-2xl p-7 space-y-4 hover:border-cyan-200 hover:shadow-xl hover:shadow-cyan-900/5 transition-all duration-500">
                  <div className="w-11 h-11 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center group-hover:bg-cyan-600 group-hover:text-white transition-colors duration-500">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-medium text-slate-900 leading-snug">{r.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{r.body}</p>
                </div>
              </Reveal>
            );
          })}
        </div>

        <Reveal delay={200}>
          <p className="text-xs text-slate-400 mt-10">
            Reference clinics available on request — call {COMPANY_DETAILS.phoneNumbers[0]}.
          </p>
        </Reveal>

      </div>
    </section>
  );
}
