import { ArrowRight, ShieldCheck, Wrench, Award, Users, MapPin, Clock } from 'lucide-react';
import { COMPANY_DETAILS } from '../data/products';
import Reveal from '../components/Reveal';
import Seo from '../components/Seo';
import Breadcrumbs from '../components/Breadcrumbs';
import { breadcrumbSchema } from '../lib/seo';
import { metaFor } from '../lib/pageMeta';

const VALUES = [
  {
    icon: ShieldCheck,
    title: 'Certified Engineers',
    description: 'Every installation and repair is handled by trained, certified technical staff — not subcontracted labour.'
  },
  {
    icon: Wrench,
    title: 'Pan-India Service',
    description: 'From Chennai to any pincode in the country, our installation and breakdown support travels with your clinic.'
  },
  {
    icon: Award,
    title: 'Premium Brands Only',
    description: 'We deal exclusively in Gamma series chairs and Woodpecker equipment — no unbranded imports.'
  },
  {
    icon: Users,
    title: 'Founder-Led Support',
    description: 'Direct access to Mr. Sivakumar for technical guidance, not a call centre queue.'
  }
];

// Declared once: the same array feeds the visible breadcrumb and the
// BreadcrumbList markup, so the two can never disagree.
const BREADCRUMB_TRAIL = [{ name: 'Home', path: '/' }, { name: 'About', path: '/about' }];

export default function About({ onOpenQuoteModal }) {
  return (
    <div className="min-h-screen bg-white text-slate-800">
      <Seo
        {...metaFor('/about')}
        schema={breadcrumbSchema(BREADCRUMB_TRAIL)}
      />

      {/* INTRO BAND */}
      <section className="relative overflow-hidden bg-blue-950 text-white page-hero">
        {/* Background glow effects */}
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none mix-blend-screen transform -translate-y-1/2 translate-x-1/4" />
        
        <div className="relative container-page max-w-4xl text-center">
          <Reveal>
            <Breadcrumbs trail={BREADCRUMB_TRAIL} />
            <span className="block text-xs uppercase tracking-widest text-cyan-400 mb-6 font-bold">
              About Care Dent
            </span>
            <h1 className="text-4xl sm:text-5xl tracking-tighter font-medium leading-[1.1]">
              {COMPANY_DETAILS.experienceYears} years of dental engineering, built on one founder&apos;s craft
            </h1>
          </Reveal>
          <Reveal delay={100}>
            <p className="text-slate-400 text-base leading-relaxed max-w-2xl mx-auto mt-6">
              {COMPANY_DETAILS.tagline}. Since {COMPANY_DETAILS.established}, {COMPANY_DETAILS.founder} and
              the Care Dent team have installed and maintained dental chairs for clinics and hospitals across India.
            </p>
          </Reveal>
        </div>
      </section>

      {/* STORY */}
      <section className="section-y">
        <div className="container-page max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            <Reveal className="lg:col-span-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/10 to-transparent rounded-[2.5rem] transform -translate-x-4 translate-y-4" />
                {/* This was an Unsplash stock photo captioned as a Care Dent
                    technician at work - a third-party image presented as our
                    own, and the site's only remaining external asset. Swapped
                    for equipment we actually supply, from the bundled
                    catalogue. */}
                <div className="relative aspect-[4/5] bg-slate-100 rounded-[2.5rem] overflow-hidden border border-slate-200 shadow-2xl">
                  <img
                    src="/products/gamma-overhanging.jpg"
                    alt="Gamma Overhanging dental chair, supplied and installed by Care Dent"
                    className="w-full h-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent mix-blend-multiply" />
                </div>
              </div>
            </Reveal>

            <div className="lg:col-span-6 space-y-5">
              <Reveal>
                <span className="block text-xs uppercase tracking-widest text-slate-400 mb-2">
                  Our Story
                </span>
                <h2 className="text-3xl sm:text-4xl tracking-tighter font-medium text-slate-900 leading-[1.15]">
                  Three decades on the clinic floor, before a single chair was ever sold
                </h2>
              </Reveal>
              <Reveal delay={100}>
                <p className="text-slate-600 leading-relaxed">
                  Long before founding Care Dent in {COMPANY_DETAILS.established}, {COMPANY_DETAILS.founder} spent
                  over {COMPANY_DETAILS.experienceYears} years servicing dental chairs, compressors, and clinical
                  electronics on-site — learning exactly where equipment fails and what clinics actually need
                  from a supplier.
                </p>
              </Reveal>
              <Reveal delay={180}>
                <p className="text-slate-600 leading-relaxed">
                  That hands-on background shapes every chair we sell today: engineered for legroom, easy to
                  service, and backed by a technician who has personally repaired thousands of units in the field.
                </p>
              </Reveal>
              <Reveal delay={260}>
                <div className="flex flex-wrap gap-3 pt-2">
                  <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 border border-slate-200 rounded-full px-4 py-2">
                    <MapPin className="w-4 h-4 text-cyan-600" />
                    <span>Based in Mugalivakkam, Chennai</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 border border-slate-200 rounded-full px-4 py-2">
                    <Clock className="w-4 h-4 text-cyan-600" />
                    <span>{COMPANY_DETAILS.workingHours}</span>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* VALUES */}
      <section className="section-y bg-slate-50 border-y border-slate-200">
        <div className="container-page max-w-7xl">
          <Reveal>
            <div className="max-w-xl mb-14">
              <span className="block text-xs uppercase tracking-widest text-slate-400 mb-2">
                Why Clinics Choose Us
              </span>
              <h2 className="text-3xl sm:text-4xl tracking-tighter font-medium text-slate-900">
                What sets Care Dent apart
              </h2>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {VALUES.map((value, idx) => (
              <Reveal key={value.title} delay={idx * 100} y={24}>
                <div className="h-full bg-white border border-slate-200 rounded-2xl p-7 space-y-4 hover:border-cyan-200 hover:shadow-lg hover:shadow-cyan-900/5 transition-all duration-500">
                  <div className="w-11 h-11 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
                    <value.icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-medium text-slate-900">{value.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{value.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden section-y bg-blue-950 text-white text-center">
        {/* Background glow effects */}
        <div className="absolute bottom-0 left-1/2 w-[600px] h-[400px] bg-cyan-500/15 rounded-full blur-[100px] pointer-events-none mix-blend-screen transform -translate-x-1/2 translate-y-1/2" />
        
        <div className="relative container-page max-w-3xl space-y-8">
          <Reveal>
            <h2 className="text-3xl sm:text-4xl tracking-tighter font-medium leading-[1.1]">
              Ready to work with Care Dent?
            </h2>
          </Reveal>
          <Reveal delay={100}>
            <p className="text-slate-400 text-base max-w-xl mx-auto">
              Get a personalized quotation and installation plan from our team.
            </p>
          </Reveal>
          <Reveal delay={200}>
            <button
              onClick={() => onOpenQuoteModal && onOpenQuoteModal()}
              className="inline-flex items-center gap-2 rounded-full bg-white text-blue-950 font-medium text-sm px-3 ps-7 py-3.5 hover:bg-cyan-50 transition-all active:scale-[0.98]"
            >
              <span>Request Official Quotation</span>
              <ArrowRight className="w-8 h-8 bg-blue-950 p-2 text-white rounded-full" />
            </button>
          </Reveal>
        </div>
      </section>

    </div>
  );
}
