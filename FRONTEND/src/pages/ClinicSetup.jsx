import { Link } from 'react-router-dom';
import {
  Ruler, ListChecks, Wallet, CalendarClock, Package, ArrowRight, CheckCircle2, Download,
} from 'lucide-react';
import { COMPANY_DETAILS } from '../data/products';
import Reveal from '../components/Reveal';
import Seo from '../components/Seo';
import { metaFor } from '../lib/pageMeta';
import { faqsFor } from '../data/faqs';
import { breadcrumbSchema, faqSchema } from '../lib/seo';
import downloadPreInstallationPdf from '../lib/preInstallationPdf';

/**
 * For a dentist opening their first practice. Deliberately broader than
 * /services/pre-installation, which covers the room's technical specification
 * in detail - this covers the whole sequence and links there for the specifics
 * rather than repeating them.
 */
const PHASES = [
  {
    icon: Ruler,
    phase: 'Before you sign the lease',
    items: [
      'Check the surgery room takes a chair plus the dentist, assistant and a moving patient',
      'Confirm the building gives you a stable single-phase supply and a proper earth',
      'Find where water comes in and where waste can actually go out',
      'Check the door width and stairwell — a chair crate has to physically reach the room',
    ],
  },
  {
    icon: ListChecks,
    phase: 'Deciding what to buy',
    items: [
      'Start from chairs: how many surgeries now, how many in three years',
      'Then the utilities that feed them — compressor and suction sized for that chair count',
      'Then sterilisation: autoclave capacity that matches your patient throughput',
      'Then imaging: RVG or portable X-ray, and the room shielding it needs',
    ],
  },
  {
    icon: Wallet,
    phase: 'Budgeting honestly',
    items: [
      'Equipment is the visible cost; civil, electrical and plumbing work is the one that surprises people',
      'Leave room for a compressor and suction that will not be strained by a second chair later',
      'Ask every supplier what installation, commissioning and staff training cost — separately',
      'Ask what a spare costs and how fast it arrives, before you need one',
    ],
  },
  {
    icon: CalendarClock,
    phase: 'Sequencing the work',
    items: [
      'Civil and plumbing first, while the equipment order is still in progress',
      'Electrical points and earthing before the walls are closed up',
      'Equipment delivered only once the room passes a site check',
      'Installation, commissioning and handover training as one block',
    ],
  },
];

const EQUIPMENT_ORDER = [
  { label: 'Dental chair & delivery unit', note: 'The decision everything else sizes around' },
  { label: 'Air compressor', note: 'Oil-free if you want dry, clean air with less servicing' },
  { label: 'Suction system', note: 'Sized for the number of chairs, not the number today' },
  { label: 'Autoclave & sterilisation', note: 'Capacity tied to your patient load' },
  { label: 'X-ray / RVG', note: 'Room shielding and placement planned in advance' },
  { label: 'Handpieces, scaler, curing light', note: 'Consumable-adjacent — plan for spares' },
  { label: 'Doctor & assistant stools', note: 'The cheapest thing that saves your back' },
];

/** Shown on the page and emitted as FAQPage markup - they must stay identical. */
const FAQS = faqsFor('/dental-clinic-setup');

export default function ClinicSetup({ onOpenQuoteModal }) {
  return (
    <div className="min-h-screen bg-white text-slate-800">
      <Seo
        {...metaFor('/dental-clinic-setup')}
        schema={[
          faqSchema(FAQS),
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Clinic Setup', path: '/dental-clinic-setup' },
          ]),
        ]}
      />

      {/* HEADER */}
      <section className="relative overflow-hidden bg-blue-950 text-white py-24 sm:py-32">
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none mix-blend-screen transform -translate-y-1/2 translate-x-1/4" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Reveal>
            <span className="block text-xs uppercase tracking-widest text-cyan-400 mb-6 font-bold">
              Opening a Dental Practice
            </span>
            <h1 className="text-4xl sm:text-5xl tracking-tighter font-medium leading-[1.1]">
              Setting up a dental clinic, in the order it actually happens
            </h1>
          </Reveal>
          <Reveal delay={100}>
            <p className="text-slate-400 text-base leading-relaxed max-w-2xl mx-auto mt-6">
              Most first-time setups go wrong in the same places: a room that cannot take
              the chair, power that was never planned for, and a compressor sized for
              today instead of year three. Here is the sequence that avoids it.
            </p>
          </Reveal>
          <Reveal delay={180}>
            <div className="flex flex-wrap items-center justify-center gap-4 mt-9">
              <Link
                to="/services/pre-installation#request-assessment"
                className="inline-flex items-center gap-2 rounded-full bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-sm px-6 py-3 transition-all active:scale-[0.98]"
              >
                <span>Get a free site assessment</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <button
                onClick={() => downloadPreInstallationPdf()}
                className="inline-flex items-center gap-2 rounded-full border border-white/20 hover:bg-white/5 text-white text-sm px-6 py-3 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Download the checklist (PDF)</span>
              </button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* PHASES */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {PHASES.map((phase, idx) => {
              const Icon = phase.icon;
              return (
                <Reveal key={phase.phase} delay={idx * 80} y={24}>
                  <div className="group h-full bg-white border border-slate-200 rounded-2xl p-8 space-y-5 hover:border-cyan-200 hover:shadow-xl hover:shadow-cyan-900/5 transition-all duration-500">
                    <div className="flex items-center justify-between">
                      <div className="w-11 h-11 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center group-hover:bg-cyan-600 group-hover:text-white transition-colors duration-500">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-medium text-slate-300 tracking-widest">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                    </div>
                    <h2 className="text-xl font-medium text-slate-900">{phase.phase}</h2>
                    <ul className="space-y-2.5">
                      {phase.items.map((item) => (
                        <li key={item} className="flex items-start gap-2.5 text-sm text-slate-500 leading-relaxed">
                          <CheckCircle2 className="w-4 h-4 text-cyan-600 shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* EQUIPMENT ORDER */}
      <section className="py-24 bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <Reveal>
              <span className="block text-xs uppercase tracking-widest text-cyan-600 mb-4 font-bold">
                What to buy, in what order
              </span>
              <h2 className="text-3xl sm:text-4xl tracking-tighter font-medium text-blue-950 leading-[1.1]">
                Everything sizes around the chair
              </h2>
            </Reveal>
            <Reveal delay={100}>
              <p className="text-slate-500 mt-4 leading-relaxed">
                Decide the chair count first. Compressor, suction and sterilisation
                capacity all follow from it — and getting that order wrong is what forces
                an early replacement.
              </p>
            </Reveal>
          </div>

          <div className="mt-12 bg-white border border-slate-200 rounded-2xl divide-y divide-slate-100 overflow-hidden">
            {EQUIPMENT_ORDER.map((item, idx) => (
              <Reveal key={item.label} delay={idx * 50}>
                <div className="flex items-start gap-5 p-6 hover:bg-slate-50/70 transition-colors">
                  <span className="text-xs font-medium text-slate-300 tracking-widest pt-1 shrink-0">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <Package className="w-5 h-5 text-cyan-600 shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <div className="font-medium text-slate-900">{item.label}</div>
                    <div className="text-sm text-slate-500 mt-1">{item.note}</div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={200}>
            <p className="text-sm text-slate-500 mt-8">
              Room-by-room technical requirements — measurements, electrical load,
              plumbing, air and suction — are covered in detail on the{' '}
              <Link to="/services/pre-installation" className="text-cyan-700 font-medium hover:underline">
                pre-installation guide
              </Link>
              .
            </p>
          </Reveal>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal>
            <h2 className="text-3xl sm:text-4xl tracking-tighter font-medium text-blue-950 leading-[1.1] text-center">
              Questions from first-time clinic owners
            </h2>
          </Reveal>
          <div className="mt-12 space-y-4">
            {FAQS.map((faq, idx) => (
              <Reveal key={faq.q} delay={idx * 60}>
                <details className="group bg-white border border-slate-200 rounded-2xl p-6 open:border-cyan-200 open:shadow-lg open:shadow-cyan-900/5 transition-all">
                  <summary className="cursor-pointer list-none font-medium text-slate-900 flex items-start justify-between gap-4">
                    <span>{faq.q}</span>
                    <span className="text-cyan-600 shrink-0 transition-transform group-open:rotate-45 text-xl leading-none">+</span>
                  </summary>
                  <p className="text-sm text-slate-500 leading-relaxed mt-4">{faq.a}</p>
                </details>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="bg-blue-950 rounded-3xl p-10 sm:p-14 text-white text-center space-y-5">
              <h2 className="text-3xl sm:text-4xl tracking-tighter font-medium leading-[1.15]">
                Send us the room. We will tell you what it takes.
              </h2>
              <p className="text-slate-400 leading-relaxed max-w-xl mx-auto">
                Room dimensions and a floor plan are enough to start. {COMPANY_DETAILS.founder} and
                the engineering team confirm what your site needs — free, before you commit
                to anything.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
                <Link
                  to="/services/pre-installation#request-assessment"
                  className="inline-flex items-center gap-2 rounded-full bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-sm px-6 py-3 transition-all active:scale-[0.98]"
                >
                  <span>Request Site Assessment</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <button
                  onClick={() => onOpenQuoteModal?.()}
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 hover:bg-white/5 text-white text-sm px-6 py-3 transition-colors"
                >
                  Request a quotation
                </button>
              </div>
              <a
                href={`tel:${COMPANY_DETAILS.phoneNumbers[0]}`}
                className="block text-xs text-slate-400 hover:text-cyan-400 transition-colors pt-1"
              >
                or call {COMPANY_DETAILS.phoneNumbers[0]}
              </a>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
