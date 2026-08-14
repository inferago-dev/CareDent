import React from 'react';
import { Stethoscope, Building2 } from 'lucide-react';
import Reveal from '../Reveal';

const BRANDS = [
  { icon: Stethoscope, name: 'Apollo Dental' },
  { icon: Building2, name: 'Saveetha Dental College' },
  { icon: Stethoscope, name: 'SmileCare Clinics' },
  { icon: Building2, name: 'SRM Dental Hospital' },
  { icon: Stethoscope, name: 'Clove Dental Partners' },
];

export default function TrustedBySection() {
  return (
    <section className="relative z-2 bg-white py-10 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <Reveal>
          <p className="text-xs uppercase tracking-widest text-slate-400 mb-6">
            Trusted by 500+ clinics and hospitals nationwide
          </p>
        </Reveal>
      </div>

      <div
        className="relative overflow-hidden text-slate-500 mask-[linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]"
      >
        <div className="flex w-max animate-marquee">
          {[...BRANDS, ...BRANDS].map(({ icon: Icon, name }, idx) => (
            <span
              key={`${name}-${idx}`}
              className="inline-flex items-center gap-2 text-sm whitespace-nowrap px-8"
            >
              <Icon className="w-4 h-4 shrink-0" /> {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
