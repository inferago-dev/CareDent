import React from 'react';
import { Link } from 'react-router-dom';
import {
  Ruler, Wrench, ShieldCheck, Calendar, Activity, PhoneCall, ClipboardCheck,
  ArrowRight, CheckCircle2, Download
} from 'lucide-react';
import { SERVICES_LIST, COMPANY_DETAILS } from '../data/products';
import Reveal from '../components/Reveal';
import ServiceRequestForm from '../components/ServiceRequestForm';
import useFetch from '../hooks/useFetch';
import { catalogApi } from '../lib/api';
import downloadPreInstallationPdf from '../lib/preInstallationPdf';
import Seo from '../components/Seo';
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
          breadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'Services', path: '/services' }]),
        ]}
      />

      {/* HEADER */}
      <section className="relative overflow-hidden bg-blue-950 text-white py-24 sm:py-32">
        {/* Background glow effects */}
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none mix-blend-screen transform -translate-y-1/2 translate-x-1/4" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Reveal>
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
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
                    className="group h-full flex flex-col bg-white border border-slate-200 rounded-2xl p-7 space-y-5 hover:border-cyan-200 hover:shadow-xl hover:shadow-cyan-900/5 transition-all duration-500"
                  >
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
                    {detailPath && (
                      <span className="mt-auto inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-700 group-hover:gap-2.5 transition-all">
                        <span>See what your site needs</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </Card>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* PRE-INSTALLATION HIGHLIGHT */}
      <section className="py-24 bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center bg-blue-950 rounded-3xl p-10 sm:p-14 text-white">
            <div className="lg:col-span-7 space-y-5">
              <Reveal>
                <span className="block text-xs uppercase tracking-widest text-slate-400 mb-2">
                  Pre-Installation & Site Readiness
                </span>
                <h2 className="text-3xl sm:text-4xl tracking-tighter font-medium leading-[1.15]">
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
                <ul className="space-y-2.5 pt-2">
                  {PRE_INSTALL_HIGHLIGHTS.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </Reveal>
              <Reveal delay={240}>
                <button
                  onClick={() => downloadPreInstallationPdf()}
                  className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Download the pre-installation checklist (PDF)</span>
                </button>
              </Reveal>
            </div>

            <Reveal delay={220} className="lg:col-span-5">
              <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 text-center space-y-5">
                <div className="text-xs uppercase tracking-widest text-slate-400">Get Started</div>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Send us your room dimensions and a floor plan. {COMPANY_DETAILS.founder} and the
                  engineering team will confirm what the site needs — free, before you commit.
                </p>
                <Link
                  to="/services/pre-installation#request-assessment"
                  className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-sm pl-6 pr-3 py-3 transition-all active:scale-[0.98]"
                >
                  <span>Request Site Assessment</span>
                  <ArrowRight className="w-8 h-8 bg-white/15 p-2 text-white rounded-full" />
                </Link>
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

      {/* BOOK A SERVICE VISIT */}
      <section id="book-service" className="py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="text-center mb-10">
              <span className="block text-xs uppercase tracking-widest text-cyan-600 mb-3 font-bold">
                Already a customer?
              </span>
              <h2 className="text-3xl sm:text-4xl tracking-tighter font-medium text-slate-900">
                Log a service request
              </h2>
              <p className="text-slate-500 text-base mt-3 max-w-xl mx-auto">
                You will get a reference number straight away, and an engineer will call to confirm the visit.
              </p>
            </div>
          </Reveal>
          <Reveal delay={100}>
            <ServiceRequestForm />
          </Reveal>
        </div>
      </section>

    </div>
  );
}
