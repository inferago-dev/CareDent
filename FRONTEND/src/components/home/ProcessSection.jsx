import { Link } from 'react-router-dom';
import { PhoneCall, Ruler, FileText, Wrench, LifeBuoy, ArrowUpRight } from 'lucide-react';
import Reveal from '../Reveal';

/**
 * What actually happens after someone enquires.
 *
 * Equipment at this price is rarely bought on the first visit - the buyer is
 * weighing who will still answer the phone in year three. Spelling out the
 * sequence answers that before they have to ask, and every step here is
 * something the business already does; nothing is aspirational.
 */
const STEPS = [
  {
    icon: PhoneCall,
    title: 'You tell us what you need',
    body: 'A call, a WhatsApp message or the enquiry form. New clinic or a replacement chair — either way we start with what the room has to fit.',
  },
  {
    icon: Ruler,
    title: 'We check the site — free',
    body: 'Measurements, doors and access, power and earthing, water, drain, compressed air and suction. Layout and Vastu advice if you want it.',
  },
  {
    icon: FileText,
    title: 'You get it in writing',
    body: 'A written quotation with the model, what is included and what your site still needs. Compare it against anyone else before you decide.',
  },
  {
    icon: Wrench,
    title: 'We install and hand over',
    body: 'Our own certified engineers install and commission the unit, then train your staff on it. Not subcontracted labour.',
  },
  {
    icon: LifeBuoy,
    title: 'We stay on the phone',
    body: 'Preventive visits, breakdown repairs and spares held in stock — so most faults are fixed in one visit instead of waiting on an order.',
  },
];

export default function ProcessSection() {
  return (
    <section className="relative z-5 section-y bg-slate-50 border-y border-slate-200">
      <div className="container-page max-w-7xl">
        <div className="max-w-2xl">
          <Reveal>
            <span className="block text-xs uppercase tracking-widest text-cyan-600 mb-4 font-bold">
              How buying from us works
            </span>
          </Reveal>
          <Reveal delay={80}>
            <h2 className="text-3xl sm:text-4xl tracking-tighter font-medium text-blue-950 leading-[1.1]">
              Five steps, and you know the engineer&apos;s name by the third.
            </h2>
          </Reveal>
          <Reveal delay={140}>
            <p className="text-slate-500 mt-4 leading-relaxed">
              Buying a chair is the easy part. What matters is who shows up when the
              suction stops working on a Monday morning.
            </p>
          </Reveal>
        </div>

        <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 mt-14">
          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            return (
              <Reveal key={step.title} delay={idx * 90} y={24}>
                <li className="group h-full list-none bg-white border border-slate-200 rounded-2xl p-6 space-y-4 hover:border-cyan-200 hover:shadow-xl hover:shadow-cyan-900/5 transition-all duration-500">
                  <div className="flex items-center justify-between">
                    <div className="w-11 h-11 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center group-hover:bg-cyan-600 group-hover:text-white transition-colors duration-500">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-medium text-slate-300 tracking-widest">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                  </div>
                  <h3 className="text-base font-medium text-slate-900 leading-snug">{step.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{step.body}</p>
                </li>
              </Reveal>
            );
          })}
        </ol>

        <Reveal delay={200}>
          <Link
            to="/services/pre-installation"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-cyan-700 hover:text-cyan-600 transition-colors mt-10"
          >
            See exactly what your site needs <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
