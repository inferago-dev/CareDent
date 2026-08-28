import { Link } from 'react-router-dom';
import {
  Phone, Wrench, Clock, PackageCheck, AlertTriangle, CheckCircle2, MessageSquare,
} from 'lucide-react';
import { COMPANY_DETAILS } from '../data/products';
import Reveal from '../components/Reveal';
import Seo from '../components/Seo';
import Breadcrumbs from '../components/Breadcrumbs';
import { metaFor } from '../lib/pageMeta';
import { faqsFor } from '../data/faqs';
import { breadcrumbSchema, faqSchema } from '../lib/seo';
import ServiceRequestForm from '../components/ServiceRequestForm';

/**
 * Landing page for repair intent - someone whose chair has stopped working and
 * is searching now. It answers the questions that decide the call (do you know
 * my equipment, do you have the part, when can you come) rather than restating
 * the /services page, which is written for planned work.
 */
const COMMON_FAULTS = [
  {
    title: 'Chair will not raise or recline',
    body: 'Usually the hydraulic pump, a limit switch or the foot control loom. Often repaired on the first visit.',
  },
  {
    title: 'Weak or dead suction',
    body: 'Blocked lines, a tired suction motor or a failed auto-drain. Frequently a flush and a seal, not a replacement.',
  },
  {
    title: 'Compressor not building pressure',
    body: 'Pressure switch, non-return valve or a worn piston ring. We service oil-free compressors as well as belt-driven.',
  },
  {
    title: 'Handpiece running hot or slow',
    body: 'Bearing wear or a scored turbine. We stock airotor and micromotor spares for same-week replacement.',
  },
  {
    title: 'Operating light flickering or dead',
    body: 'LED driver, sensor board or a loose harness at the doctor unit arm.',
  },
  {
    title: 'Scaler with no output',
    body: 'Tip wear, a cracked piezo stack or the handpiece cable. Woodpecker optic scalers are serviced in house.',
  },
];

const WHAT_YOU_GET = [
  'A reference number the moment you log the request',
  'A call from an engineer to confirm the fault and the slot',
  'Spares carried to the visit where the fault is already clear',
  'The same engineers who install our equipment — not subcontractors',
];

/** Shown on the page and emitted as FAQPage markup - they must stay identical. */
const FAQS = faqsFor('/dental-chair-service-chennai');

// Declared once: the same array feeds the visible breadcrumb and the
// BreadcrumbList markup, so the two can never disagree.
const BREADCRUMB_TRAIL = [
  { name: 'Home', path: '/' },
  { name: 'Services', path: '/services' },
  { name: 'Dental Chair Service in Chennai', path: '/dental-chair-service-chennai' },
];

export default function ChennaiService({ onOpenQuoteModal }) {
  return (
    <div className="min-h-screen bg-white text-slate-800">
      <Seo
        {...metaFor('/dental-chair-service-chennai')}
        schema={[
          faqSchema(FAQS),
          breadcrumbSchema(BREADCRUMB_TRAIL),
        ]}
      />

      {/* HEADER */}
      <section className="relative overflow-hidden bg-blue-950 text-white page-hero">
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none mix-blend-screen transform -translate-y-1/2 translate-x-1/4" />
        <div className="relative container-page max-w-4xl text-center">
          <Reveal>
            <Breadcrumbs trail={BREADCRUMB_TRAIL} />
            <span className="block text-xs uppercase tracking-widest text-cyan-400 mb-6 font-bold">
              Dental Equipment Repair · Chennai
            </span>
            <h1 className="text-4xl sm:text-5xl tracking-tighter font-medium leading-[1.1]">
              Chair down? Talk to an engineer, not a call centre.
            </h1>
          </Reveal>
          <Reveal delay={100}>
            <p className="text-slate-400 text-base leading-relaxed max-w-2xl mx-auto mt-6">
              Care Dent repairs dental chairs, compressors, autoclaves, X-ray units and
              handpieces across Chennai — whoever you bought them from. Spares are held
              in stock, so most faults are finished in a single visit.
            </p>
          </Reveal>
          <Reveal delay={180}>
            <div className="flex flex-wrap items-center justify-center gap-4 mt-9">
              <a
                href={`tel:${COMPANY_DETAILS.phoneNumbers[0]}`}
                className="inline-flex items-center gap-2 rounded-full bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-sm px-6 py-3 transition-all active:scale-[0.98]"
              >
                <Phone className="w-4 h-4" />
                <span>{COMPANY_DETAILS.phoneNumbers[0]}</span>
              </a>
              <a
                href="#book-service"
                className="inline-flex items-center gap-2 rounded-full border border-white/20 hover:bg-white/5 text-white text-sm px-6 py-3 transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Log a service request</span>
              </a>
            </div>
          </Reveal>
          <Reveal delay={240}>
            <p className="text-xs text-slate-500 mt-6">{COMPANY_DETAILS.workingHours}</p>
          </Reveal>
        </div>
      </section>

      {/* WHAT WE FIX */}
      <section className="section-y">
        <div className="container-page max-w-7xl">
          <div className="max-w-2xl">
            <Reveal>
              <span className="block text-xs uppercase tracking-widest text-cyan-600 mb-4 font-bold">
                What we are usually called for
              </span>
              <h2 className="text-3xl sm:text-4xl tracking-tighter font-medium text-blue-950 leading-[1.1]">
                The faults that stop a surgery for the day
              </h2>
            </Reveal>
            <Reveal delay={100}>
              <p className="text-slate-500 mt-4 leading-relaxed">
                If your symptom is on this list, describe it when you call — the engineer
                can often bring the part with them.
              </p>
            </Reveal>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-14">
            {COMMON_FAULTS.map((fault, idx) => (
              <Reveal key={fault.title} delay={idx * 70} y={24}>
                <div className="group h-full bg-white border border-slate-200 rounded-2xl p-7 space-y-4 hover:border-cyan-200 hover:shadow-xl hover:shadow-cyan-900/5 transition-all duration-500">
                  <div className="w-11 h-11 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center group-hover:bg-cyan-600 group-hover:text-white transition-colors duration-500">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-medium text-slate-900 leading-snug">{fault.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{fault.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* WHAT YOU GET */}
      <section className="section-y bg-slate-50 border-y border-slate-200">
        <div className="container-page max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center bg-blue-950 rounded-3xl p-10 sm:p-14 text-white">
            <div className="lg:col-span-7 space-y-5">
              <Reveal>
                <h2 className="text-3xl sm:text-4xl tracking-tighter font-medium leading-[1.15]">
                  What happens when you log a request
                </h2>
              </Reveal>
              <Reveal delay={100}>
                <ul className="space-y-2.5 pt-2">
                  {WHAT_YOU_GET.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </Reveal>
            </div>
            <Reveal delay={160} className="lg:col-span-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-4">
                {[
                  { icon: Wrench, label: 'In-house engineers', sub: 'Never subcontracted' },
                  { icon: PackageCheck, label: 'Spares in stock', sub: 'Same-week replacement' },
                  { icon: Clock, label: 'Mon – Sat, 9 – 7', sub: 'Phone advice first' },
                ].map(({ icon: Icon, label, sub }) => (
                  <div key={label} className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-5 flex items-center gap-4">
                    <div className="bg-cyan-500/20 p-2.5 rounded-xl border border-cyan-500/20 shrink-0">
                      <Icon className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm text-white">{label}</div>
                      <div className="text-xs text-slate-400">{sub}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section-y">
        <div className="container-page max-w-3xl">
          <Reveal>
            <h2 className="text-3xl sm:text-4xl tracking-tighter font-medium text-blue-950 leading-[1.1] text-center">
              Questions we get on the first call
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

      {/* BOOK */}
      <section id="book-service" className="section-y bg-slate-50 border-t border-slate-200">
        <div className="container-page max-w-3xl">
          <Reveal>
            <div className="text-center mb-10">
              <h2 className="text-3xl sm:text-4xl tracking-tighter font-medium text-slate-900">
                Log a service request
              </h2>
              <p className="text-slate-500 text-base mt-3 max-w-xl mx-auto">
                You get a reference number straight away. For a chair that is down right
                now, calling {COMPANY_DETAILS.phoneNumbers[0]} is faster.
              </p>
            </div>
          </Reveal>
          <Reveal delay={100}>
            <ServiceRequestForm />
          </Reveal>
          <Reveal delay={160}>
            <p className="text-center text-sm text-slate-500 mt-10">
              Planning a new clinic instead?{' '}
              <Link to="/dental-clinic-setup" className="text-cyan-700 font-medium hover:underline">
                Read the clinic setup guide
              </Link>{' '}
              or{' '}
              <button onClick={() => onOpenQuoteModal?.()} className="text-cyan-700 font-medium hover:underline">
                request a quotation
              </button>
              .
            </p>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
