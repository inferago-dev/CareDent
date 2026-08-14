import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import Reveal from '../Reveal';
import useParallax from '../../hooks/useParallax';

const TESTIMONIALS = [
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

const AUTOPLAY_INTERVAL = 4000;
const TRANSITION_MS = 1000;

export default function TestimonialsSection() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = backward
  const [isAnimating, setIsAnimating] = useState(false);
  const [displayedTestimonial, setDisplayedTestimonial] = useState(0);
  const parallaxRef = useParallax(0.05);
  const len = TESTIMONIALS.length;

  const goTo = (index, dir = 1) => {
    const next = ((index % len) + len) % len;
    if (next === currentTestimonial) return;
    setDirection(dir);
    setIsAnimating(true);
    setCurrentTestimonial(next);
  };

  useEffect(() => {
    const id = setInterval(() => {
      setDirection(1);
      setIsAnimating(true);
      setCurrentTestimonial((prev) => (prev + 1) % len);
    }, AUTOPLAY_INTERVAL);
    return () => clearInterval(id);
  }, [len]);

  // Swap the displayed content only after the exit animation finishes,
  // so we're always animating a single card in/out rather than stacking cards.
  useEffect(() => {
    if (!isAnimating) return;
    const t = setTimeout(() => {
      setDisplayedTestimonial(currentTestimonial);
      setIsAnimating(false);
    }, TRANSITION_MS / 2);
    return () => clearTimeout(t);
  }, [currentTestimonial, isAnimating]);

  const t = TESTIMONIALS[displayedTestimonial];

  return (
    <section className="relative z-4 py-16 bg-white overflow-hidden">
      <div ref={parallaxRef} className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center will-change-transform w-full">
        <Reveal>
          <span className="block text-xs uppercase tracking-widest text-slate-400 mb-2">
            Testimonials
          </span>
          <h3 className="text-3xl sm:text-4xl tracking-tighter font-semibold text-blue-950 mb-6">
            What leading dentists say
          </h3>
        </Reveal>

        <div className="flex gap-1 justify-center mb-2">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
          ))}
        </div>

        <div className="relative min-h-40 sm:min-h-40 flex items-center justify-center">
          <div
            key={displayedTestimonial}
            className="w-full max-w-lg transition-all ease-in-out"
            style={{
              transitionDuration: `${TRANSITION_MS}ms`,
              opacity: isAnimating ? 0 : 1,
              transform: isAnimating
                ? `translateY(${direction > 0 ? '20px' : '-20px'}) scale(0.95)`
                : 'translateY(0) scale(1)',
            }}
          >
            <div className="bg-white border border-slate-200 p-4 sm:p-8">
              <p className="text-xl sm:text-2xl text-slate-800 font-playfair italic leading-relaxed tracking-tight">
                {t.quote}
              </p>
              <div className="mt-6">
                <div className="text-slate-900 text-base font-medium">{t.author}</div>
                <div className="text-sm text-slate-500 mt-1">{t.clinic} · {t.city}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation — plain, understated */}
        <div className="flex items-center justify-center gap-8 mt-8 pt-6 border-t border-slate-100">
          <button
            onClick={() => goTo(currentTestimonial - 1, -1)}
            aria-label="Previous testimonial"
            className="text-slate-300 hover:text-slate-900 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2">
            {TESTIMONIALS.map((_, idx) => (
              <button
                key={idx}
                onClick={() => goTo(idx, idx > currentTestimonial ? 1 : -1)}
                aria-label={`Show testimonial ${idx + 1}`}
                className={`h-1 rounded-full transition-all duration-300 ${currentTestimonial === idx ? 'w-5 bg-slate-900' : 'w-1 bg-slate-300 hover:bg-slate-400'
                  }`}
              />
            ))}
          </div>

          <button
            onClick={() => goTo(currentTestimonial + 1, 1)}
            aria-label="Next testimonial"
            className="text-slate-300 hover:text-slate-900 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
}