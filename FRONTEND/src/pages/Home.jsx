import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight, ArrowUpRight, CheckCircle2, Wrench, Building2,
  ChevronLeft, ChevronRight, Stethoscope, Star, MessageSquare
} from 'lucide-react';
import { DENTAL_CHAIRS, SERVICES_LIST, COMPANY_DETAILS } from '../data/products';
import Reveal from '../components/Reveal';

function useCountUp(end, duration = 2200) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);
  const rafId = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;

          const isNumber = typeof end === 'number';
          const numericEnd = isNumber
            ? end
            : parseInt(String(end).replace(/\D/g, ''), 10) || 0;
          const suffix = isNumber ? '' : String(end).replace(/[\d]/g, '');

          const startTime = performance.now();
          const easeOutExpo = (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

          const step = (now) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = easeOutExpo(progress);
            const current = Math.round(eased * numericEnd);

            setCount(isNumber ? current : `${current}${suffix}`);

            if (progress < 1) {
              rafId.current = requestAnimationFrame(step);
            }
          };

          rafId.current = requestAnimationFrame(step);
        }
      },
      { threshold: 0.25 }
    );

    if (ref.current) observer.observe(ref.current);

    return () => {
      observer.disconnect();
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [end, duration]);

  return [count, ref];
}

function StatItem({ value, label }) {
  const [display, ref] = useCountUp(value);

  return (
    <div ref={ref}>
      <div className="text-4xl sm:text-5xl tracking-tighter font-medium">
        {display}
      </div>
      <div className="text-sm mt-2 text-slate-400">{label}</div>
    </div>
  );
}

export default function Home({ onOpenQuoteModal }) {
  const navigate = useNavigate();
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const testimonials = [
    {
      quote: "Care Dent provided exceptional installation for our 4-chair clinic in Chennai. The Gamma Overhanging model's legroom and Woodpecker scaler integration are world-class.",
      author: "Dr. A. Ramesh, MDS",
      clinic: "Ramesh Multispecialty Dental Center",
      city: "Chennai"
    },
    {
      quote: "Sivakumar sir's 30+ years of technical experience is evident in every interaction. Quick breakdown response and transparent AMC service.",
      author: "Dr. Meenakshi Sundaram",
      clinic: "Smile Care Hospital",
      city: "Coimbatore"
    },
    {
      quote: "The Gamma Premium chair ergonomics reduced my lower back strain significantly. Highly recommend Care Dent for any dentist upgrading their practice.",
      author: "Dr. Priya Varma",
      clinic: "Varma Dental & Implant Studio",
      city: "Bangalore"
    }
  ];

  const goTo = (index) => {
    if (isAnimating || index === currentTestimonial) return;
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentTestimonial(index);
      setIsAnimating(false);
    }, 250);
  };

  const handleNextTestimonial = () => {
    goTo((currentTestimonial + 1) % testimonials.length);
  };

  const handlePrevTestimonial = () => {
    goTo((currentTestimonial - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">

      {/* TRUSTED BY */}
      <section className="bg-white py-10 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Reveal>
            <p className="text-xs uppercase tracking-widest text-slate-400 mb-6">
              Trusted by 500+ clinics and hospitals nationwide
            </p>
          </Reveal>
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-4 text-slate-500">
            {[
              { icon: Stethoscope, name: 'Apollo Dental' },
              { icon: Building2, name: 'Saveetha Dental College' },
              { icon: Stethoscope, name: 'SmileCare Clinics' },
              { icon: Building2, name: 'SRM Dental Hospital' },
              { icon: Stethoscope, name: 'Clove Dental Partners' },
            ].map(({ icon: Icon, name }, idx) => (
              <Reveal key={name} delay={idx * 80} y={12} as="span" className="inline-flex items-center gap-2 text-sm">
                <Icon className="w-4 h-4" /> {name}
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* AT A GLANCE — bento grid: about, testimonial, flagship models, services, WhatsApp */}
      <section className="py-24 bg-slate-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* About — large dark tile */}
            <Reveal className="lg:col-span-7">
              <div className="h-full bg-blue-950 text-white rounded-3xl p-10 sm:p-12 flex flex-col">
                <span className="block text-xs uppercase tracking-widest text-slate-400 mb-8">
                  About Us
                </span>
                <h2 className="text-3xl sm:text-4xl tracking-tighter font-medium leading-[1.1]">
                  Professional dental equipment solutions for modern clinical practices
                </h2>
                <p className="text-slate-400 text-base leading-relaxed max-w-xl mt-5">
                  Established in January 2023 by Mr. Sivakumar, Care Dent specializes
                  in dental equipment, chair mechanics, electronic systems, and
                  clinical ergonomics.
                </p>

                <div className="grid grid-cols-2 border-t border-white/10 mt-auto gap-8 pt-10">
                  {[
                    { value: COMPANY_DETAILS.experienceYears, label: 'Years Experience' },
                    { value: '500+', label: 'Clinics Served' },
                    { value: '1200+', label: 'Chairs Installed' },
                    { value: '45+', label: 'Cities Covered' },
                  ].map((stat) => (
                    <StatItem key={stat.label} value={stat.value} label={stat.label} />
                  ))}
                </div>
              </div>
            </Reveal>

            {/* Testimonials — light tile, minimal crossfade */}
            <Reveal delay={100} className="lg:col-span-5">
              <div className="h-full bg-white border border-slate-200 rounded-3xl p-8 sm:p-10 flex flex-col">
                <span className="block text-xs uppercase tracking-widest text-slate-400 mb-2">
                  Testimonials
                </span>
                <h3 className="text-2xl tracking-tighter font-medium text-slate-900 mb-6">
                  What leading dentists say
                </h3>

                <div className="flex gap-1 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>

                <div
                  className="relative flex-1 min-h-[8rem] transition-all duration-250 ease-out"
                  style={{
                    opacity: isAnimating ? 0 : 1,
                    transform: isAnimating ? 'translateY(6px)' : 'translateY(0)',
                  }}
                >
                  <p className="text-lg text-slate-800 font-playfair italic leading-relaxed tracking-tight">
                    {testimonials[currentTestimonial].quote}
                  </p>
                  <div className="mt-6">
                    <div className="text-slate-900 text-sm font-medium">
                      {testimonials[currentTestimonial].author}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      {testimonials[currentTestimonial].clinic} · {testimonials[currentTestimonial].city}
                    </div>
                  </div>
                </div>

                {/* Navigation — plain, understated */}
                <div className="flex items-center gap-8 mt-8 pt-6 border-t border-slate-100">
                  <button
                    onClick={handlePrevTestimonial}
                    aria-label="Previous testimonial"
                    className="text-slate-300 hover:text-slate-900 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <div className="flex items-center gap-2">
                    {testimonials.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => goTo(idx)}
                        aria-label={`Show testimonial ${idx + 1}`}
                        className={`h-1 rounded-full transition-all duration-300 ${currentTestimonial === idx ? 'w-5 bg-slate-900' : 'w-1 bg-slate-300 hover:bg-slate-400'
                          }`}
                      />
                    ))}
                  </div>

                  <button
                    onClick={handleNextTestimonial}
                    aria-label="Next testimonial"
                    className="text-slate-300 hover:text-slate-900 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </Reveal>

            {/* Featured Dental Chairs — wide tile */}
            <Reveal delay={80} className="lg:col-span-12">
              <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
                  <div>
                    <span className="block text-xs uppercase tracking-widest text-slate-400 mb-2">
                      Flagship Models
                    </span>
                    <h2 className="text-2xl sm:text-3xl tracking-tighter font-medium text-slate-900">
                      Featured Dental Chairs
                    </h2>
                  </div>
                  <Link
                    to="/products"
                    className="inline-flex items-center gap-2 text-sm font-medium text-slate-900 border-b border-slate-900 pb-0.5 w-fit hover:text-cyan-700 hover:border-cyan-700 transition-colors"
                  >
                    <span>Explore all models</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {DENTAL_CHAIRS.slice(0, 3).map((chair, idx) => (
                    <Reveal key={chair.id} delay={idx * 120} y={32} duration={800}>
                      <div className="group bg-white rounded-2xl border border-slate-200 hover:border-cyan-200 hover:shadow-xl hover:shadow-cyan-900/5 transition-all duration-500 h-full flex flex-col overflow-hidden">

                        {/* Image */}
                        <div className="relative h-64 bg-slate-50 overflow-hidden">
                          <img
                            src={chair.heroImage}
                            alt={chair.name}
                            className="w-full h-full object-contain p-4 mix-blend-multiply transition-transform duration-700 ease-out group-hover:scale-[1.08]"
                          />
                          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                          <span className="absolute top-4 left-4 text-[10px] font-bold uppercase tracking-widest text-cyan-800 bg-cyan-100/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm">
                            {chair.series}
                          </span>
                        </div>

                        {/* Body */}
                        <div className="p-7 flex flex-col flex-1 gap-5">
                          <div className="space-y-2">
                            <h3 className="text-xl font-medium text-slate-900 tracking-tight group-hover:text-cyan-700 transition-colors">
                              {chair.name}
                            </h3>
                            <p className="text-slate-500 text-sm leading-relaxed line-clamp-2">
                              {chair.description}
                            </p>
                          </div>

                          <ul className="space-y-2 py-4 border-y border-slate-100">
                            {chair.keyDifferentiators.slice(0, 3).map((diff, i) => (
                              <li key={i} className="flex items-start gap-2.5 text-xs text-slate-600">
                                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-700 shrink-0 mt-0.5" />
                                <span className="line-clamp-1">{diff}</span>
                              </li>
                            ))}
                          </ul>

                          <div className="flex items-center justify-between mt-auto pt-3">
                            <Link
                              to={`/products/${chair.slug}`}
                              className="inline-flex items-center gap-1 text-sm font-semibold text-slate-600 hover:text-cyan-700 transition-colors"
                            >
                              View details
                              <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                            </Link>
                            <button
                              onClick={() => onOpenQuoteModal(chair.name)}
                              className="text-xs font-semibold text-white bg-slate-900 hover:bg-cyan-700 px-5 py-2.5 rounded-full transition-colors shadow-md shadow-slate-900/20"
                            >
                              Request Quote
                            </button>
                          </div>
                        </div>
                      </div>
                    </Reveal>
                  ))}
                </div>
              </div>
            </Reveal>

            {/* Services — wide dark tile */}
            <Reveal className="lg:col-span-8">
              <div className="h-full bg-blue-950 rounded-3xl p-8 sm:p-10">
                <div className="max-w-xl mb-10">
                  <span className="block text-xs uppercase tracking-widest text-slate-400 mb-2">
                    Our Services
                  </span>
                  <h2 className="text-2xl sm:text-3xl tracking-tighter font-medium text-white">
                    End-to-end technical support
                  </h2>
                  <p className="text-slate-400 text-sm mt-3 leading-relaxed">
                    We stand behind every chair we install with dedicated certified engineers.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {SERVICES_LIST.slice(0, 3).map((service, idx) => (
                    <Reveal key={service.id} delay={idx * 120} y={24}>
                      <div className="group h-full p-6 flex flex-col gap-5 rounded-xl bg-white/5 border border-white/15 hover:border-white/25 hover:bg-white/10 transition-colors duration-500">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-white tracking-widest">
                            {String(idx + 1).padStart(2, '0')}
                          </span>
                          <div className="w-10 h-10 rounded-full bg-cyan-600/20 flex items-center justify-center text-cyan-400 group-hover:bg-cyan-400/10 transition-colors duration-500">
                            <Wrench className="w-4 h-4" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-lg font-medium text-white">{service.title}</h3>
                          <p className="text-white/40 text-sm leading-relaxed">{service.description}</p>
                        </div>
                        <Link
                          to="/services"
                          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-300 hover:text-cyan-400 transition-colors mt-auto pt-2"
                        >
                          <span>Learn more</span>
                          <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                        </Link>
                      </div>
                    </Reveal>
                  ))}
                </div>
              </div>
            </Reveal>

            {/* WhatsApp — small accent tile */}
            <Reveal delay={120} className="lg:col-span-4">
              <a
                href={`https://wa.me/${COMPANY_DETAILS.whatsappNumber}?text=${encodeURIComponent('Hello Care Dent team, I am interested in inquiring about dental equipment.')}`}
                target="_blank"
                rel="noreferrer"
                className="group h-full bg-cyan-600 hover:bg-cyan-500 rounded-3xl p-8 sm:p-10 flex flex-col justify-between text-white transition-colors duration-500"
              >
                <div className="w-11 h-11 rounded-2xl bg-white/15 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div className="mt-8 space-y-2">
                  <h3 className="text-lg font-medium">Talk to our engineers</h3>
                  <p className="text-white/80 text-sm leading-relaxed">
                    Get instant answers on pricing, installation timelines, and AMC plans.
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold mt-6">
                  <span>Chat on WhatsApp</span>
                  <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>
              </a>
            </Reveal>

          </div>
        </div>
      </section>

      {/* REQUEST QUOTE BANNER */}
      <section className="py-24 bg-blue-950 text-white overflow-hidden">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <Reveal>
            <h2 className="text-3xl sm:text-4xl tracking-tighter font-medium leading-[1.1]">
              Ready to upgrade your practice with Care Dent?
            </h2>
          </Reveal>
          <Reveal delay={100}>
            <p className="text-slate-400 text-base max-w-xl mx-auto">
              Get a personalized quotation, chair customization details, and certified
              technician installation advice today.
            </p>
          </Reveal>
          <Reveal delay={200}>
            <div className="pt-2">
              <button
                onClick={() => onOpenQuoteModal()}
                className="inline-flex items-center gap-2 rounded-full bg-white text-blue-950 font-medium text-sm px-7 py-3.5 hover:bg-cyan-50 transition-colors"
              >
                <span>Request Official Quotation</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </Reveal>
        </div>
      </section>

    </div>
  );
}