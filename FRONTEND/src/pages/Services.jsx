import { Link } from 'react-router-dom';
import {
  Ruler, Wrench, ShieldCheck, Calendar, Activity, PhoneCall, ClipboardCheck,
  ArrowUpRight, CheckCircle2, Download
} from 'lucide-react';
import { SERVICES_LIST, COMPANY_DETAILS } from '../data/products';
import Reveal from '../components/Reveal';
import ServiceRequestForm from '../components/ServiceRequestForm';
import useFetch from '../hooks/useFetch';
import { catalogApi } from '../lib/api';
import downloadPreInstallationPdf from '../lib/preInstallationPdf';
import Seo from '../components/Seo';
import Breadcrumbs from '../components/Breadcrumbs';
import { serviceSchema, breadcrumbSchema } from '../lib/seo';
import { metaFor } from '../lib/pageMeta';

const ICONS = { Ruler, Wrench, ShieldCheck, Calendar, Activity, PhoneCall, ClipboardCheck };

/** Services that have a dedicated page rather than just a card. */
const DETAIL_PATHS = { 'pre-installation': '/services/pre-installation' };

const PRE_INSTALL_HIGHLIGHTS = [
  'Room, door and access measurements checked against the unit',
  'Electrical points, earthing and stabiliser requirements',
  'Water inlet, drain, compressed air and suction positions',
  'Optional layout and Vastu consultation, at no extra cost'
];

// Declared once: the same array feeds the visible breadcrumb and the
// BreadcrumbList markup, so the two can never disagree.
const BREADCRUMB_TRAIL = [{ name: 'Home', path: '/' }, { name: 'Services', path: '/services' }];

export default function Services() {
  // Services are editable from the admin content manager; fall back to the
  // bundled list if the API is unreachable so the page is never empty.
  const { data } = useFetch((signal) => catalogApi.services({ signal }), []);
  const services = data?.data?.length ? data.data : SERVICES_LIST;

  return (
    <div className="min-h-screen bg-white text-slate-800">
      <Seo
        {...metaFor('/services')}
        schema={[
          serviceSchema(services),
          breadcrumbSchema(BREADCRUMB_TRAIL),
        ]}
      />

      {/* HEADER */}
      <section className="relative overflow-hidden bg-blue-950 text-white page-hero">
        {/* Background glow effects */}
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none mix-blend-screen transform -translate-y-1/2 translate-x-1/4" />

        <div className="relative container-page max-w-4xl text-center">
          <Reveal>
            <Breadcrumbs trail={BREADCRUMB_TRAIL} align="center" />
            <span className="block text-xs uppercase tracking-widest text-cyan-400 mb-6 font-bold">
              Services & Support
            </span>
            <h1 className="text-4xl sm:text-5xl tracking-tighter font-medium leading-[1.1]">
              Technical support that outlasts the sale
            </h1>
          </Reveal>
          <Reveal delay={100}>
            <p className="text-slate-400 text-base leading-relaxed max-w-2xl mx-auto mt-6">
              From the first site survey to the call you make three years later — certified engineers,
              stocked spares, and a founder who still answers technical calls himself.
            </p>
          </Reveal>
        </div>
      </section>

      {/* SERVICES GRID */}
      <section className="section-y">
        <div className="container-page max-w-7xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, idx) => {
              const Icon = ICONS[service.iconName] || Wrench;
              // Pre-installation is the one service with a page of its own.
              const detailPath = DETAIL_PATHS[service.key || service.id];
              const Card = detailPath ? Link : 'div';
              return (
                <Reveal key={service._id || service.key || service.id} delay={idx * 80} y={24}>
                  <Card
                    {...(detailPath ? { to: detailPath } : {})}
                    className="group h-full flex flex-col bg-white border border-slate-200 rounded-2xl p-7 hover:border-cyan-200 hover:shadow-xl hover:shadow-cyan-900/5 transition-all duration-500"
                  >
                    <div className="flex items-start justify-between">
                      <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 text-blue-950 flex items-center justify-center group-hover:bg-blue-950 group-hover:border-blue-950 group-hover:text-white transition-colors duration-500">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-medium text-slate-300 tracking-widest pt-1">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                    </div>

                    <div className="space-y-2 mt-8">
                      <h3 className="text-xl font-medium tracking-tight text-blue-950">{service.title}</h3>
                      <p className="text-sm text-slate-500 leading-relaxed">{service.description}</p>
                    </div>

                    {/* Action row — a card that is itself a link can't hold another link,
                        so the pre-installation card shows its action as plain text. */}
                    <div className="mt-auto pt-6">
                      <div className="flex items-center justify-between gap-3 pt-5 border-t border-slate-100">
                        {detailPath ? (
                          <span className="text-sm font-medium text-slate-700 group-hover:text-blue-950 transition-colors">
                            See what your site needs
                          </span>
                        ) : (
                          <a
                            href="#book-service"
                            className="text-sm font-medium text-slate-700 hover:text-blue-950 transition-colors"
                          >
                            Book a visit
                          </a>
                        )}
                        <span className="w-8 h-8 rounded-full border border-slate-200 text-slate-500 flex items-center justify-center group-hover:bg-blue-950 group-hover:border-blue-950 group-hover:text-white transition-colors duration-500">
                          <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                        </span>
                      </div>
                    </div>
                  </Card>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* PRE-INSTALLATION HIGHLIGHT */}
      <section className="section-pb">
        <div className="container-page max-w-7xl">
          <div className="relative overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-12 items-center lg:items-stretch bg-blue-950 rounded-3xl p-8 sm:p-14 text-white">

            {/* Concentric circles pattern — same motif as the home hero and CTA */}
            <svg
              className="absolute -right-40 -top-40 w-[620px] h-[620px] pointer-events-none"
              viewBox="0 0 600 600"
              fill="none"
            >
              {[60, 110, 160, 210, 260, 310, 360].map((r, i) => (
                <circle key={r} cx="300" cy="300" r={r} stroke="white" strokeOpacity={0.12 - i * 0.006} strokeWidth="1" />
              ))}
            </svg>

            {/* Glassmorphism blur glow */}
            <div className="absolute inset-x-0 bottom-0 h-40 pointer-events-none">
              <div className="absolute -bottom-16 left-1/4 w-72 h-72 bg-cyan-500/25 rounded-full blur-3xl" />
              <div className="absolute -bottom-20 right-1/4 w-72 h-72 bg-blue-400/15 rounded-full blur-3xl" />
            </div>

            <div className="relative lg:col-span-7 space-y-6">
              <Reveal>
                <span className="block text-xs uppercase tracking-widest text-cyan-400 mb-4 font-bold">
                  Pre-Installation &amp; Site Readiness
                </span>
                <h2 className="text-3xl sm:text-4xl tracking-tighter font-medium leading-[1.1]">
                  Get the room right, and installation day is boring.
                </h2>
              </Reveal>
              <Reveal delay={100}>
                <p className="text-slate-400 leading-relaxed max-w-lg">
                  Before a single crate leaves our warehouse we check your site against the equipment —
                  measurements, power, plumbing, air and suction — so nothing is discovered on the day the
                  chair arrives.
                </p>
              </Reveal>
              <Reveal delay={180}>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-6 border-t border-white/10">
                  {PRE_INSTALL_HIGHLIGHTS.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm text-slate-300 leading-snug">
                      <span className="w-6 h-6 rounded-full bg-white text-blue-950 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </span>
                      <span className="pt-0.5">{item}</span>
                    </li>
                  ))}
                </ul>
              </Reveal>
              <Reveal delay={240}>
                <button
                  onClick={() => downloadPreInstallationPdf()}
                  className="inline-flex items-center gap-2 rounded-full backdrop-blur-xl bg-white/5 border border-white/15 hover:bg-white/10 text-white font-medium text-sm px-5 py-2.5 transition-all active:scale-[0.98]"
                >
                  <Download className="w-4 h-4" />
                  <span>Download checklist (PDF)</span>
                </button>
              </Reveal>
            </div>

            <Reveal delay={220} className="relative lg:col-span-5 h-full">
              <div className="h-full flex flex-col justify-between gap-6 backdrop-blur-xl bg-white/10 rounded-2xl p-7 sm:p-10">
                <div className="space-y-3">
                  <span className="block text-xs border border-white/30 w-fit px-2 py-0.5 uppercase rounded text-white">Get Started</span>
                  <p className="text-slate-300 leading-relaxed">
                    Send us your room dimensions and a floor plan. {COMPANY_DETAILS.founder} and the
                    engineering team will confirm what the site needs — free, before you commit.
                  </p>
                </div>
                <Link
                  to="/services/pre-installation#request-assessment"
                  className="group w-full inline-flex items-center justify-between gap-3 rounded-full bg-white hover:bg-cyan-50 text-blue-950 font-medium text-sm py-1.5 pl-6 pr-1.5 transition-all active:scale-[0.98]"
                >
                  <span>Request Site Assessment</span>
                  <span className="w-9 h-9 rounded-full bg-blue-950 text-white flex items-center justify-center">
                    <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </span>
                </Link>
                <a
                  href={COMPANY_DETAILS.phoneHrefs[0]}
                  className="group flex items-center gap-3 pt-5 border-t border-white/10"
                >
                  <span className="w-9 h-9 rounded-full border border-white/15 text-slate-300 flex items-center justify-center shrink-0 group-hover:bg-white group-hover:text-blue-950 transition-colors">
                    <PhoneCall className="w-4 h-4" />
                  </span>
                  <span className="leading-tight">
                    <span className="block text-xs text-slate-400">Or call us</span>
                    <span className="block text-sm text-white">{COMPANY_DETAILS.phoneNumbers[0]}</span>
                  </span>
                </a>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* BOOK A SERVICE VISIT */}
      <section id="book-service" className="section-pb scroll-mt-24">
        <div className="container-page max-w-3xl">
          <Reveal>
            <div className="text-center mb-10">
              <span className="block text-xs uppercase tracking-widest text-cyan-600 mb-4 font-bold">
                Already a customer?
              </span>
              <h2 className="text-3xl sm:text-4xl tracking-tighter font-medium text-blue-950 leading-[1.1]">
                Log a service request
              </h2>
              <p className="text-slate-500 leading-relaxed mt-4 max-w-xl mx-auto">
                You will get a reference number straight away, and an engineer will call to confirm the visit.
              </p>
            </div>
          </Reveal>
          <Reveal delay={100}>
            <ServiceRequestForm />
          </Reveal>
          <Reveal delay={160}>
            <Link
              to="/dental-chair-service-chennai"
              className="group mt-6 flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-white hover:border-cyan-200 px-6 py-5 transition-all duration-500"
            >
              <span>
                <span className="block text-sm font-medium text-blue-950">Equipment down right now?</span>
                <span className="block text-sm text-slate-500 mt-0.5">See what we repair and how fast, or call {COMPANY_DETAILS.phoneNumbers[0]}.</span>
              </span>
              <span className="w-9 h-9 rounded-full border border-slate-200 bg-white text-slate-500 flex items-center justify-center shrink-0 group-hover:bg-blue-950 group-hover:border-blue-950 group-hover:text-white transition-colors duration-500">
                <ArrowUpRight className="w-4 h-4" />
              </span>
            </Link>
          </Reveal>
        </div>
      </section>

    </div>
  );
}
