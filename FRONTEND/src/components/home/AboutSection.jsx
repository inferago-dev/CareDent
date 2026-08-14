import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { COMPANY_DETAILS } from '../../data/products';
import Reveal from '../Reveal';
import useParallax from '../../hooks/useParallax';

/* ── Animated counter ──────────────────────────────────── */
function useCountUp(end, duration = 2000) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);
  const rafId = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const numeric = parseInt(String(end).replace(/\D/g, ''), 10) || 0;
        const suffix = String(end).replace(/[\d]/g, '');
        const startTime = performance.now();
        const ease = (t) => 1 - Math.pow(1 - t, 3);
        const step = (now) => {
          const p = Math.min((now - startTime) / duration, 1);
          setCount(`${Math.round(ease(p) * numeric)}${suffix}`);
          if (p < 1) rafId.current = requestAnimationFrame(step);
        };
        rafId.current = requestAnimationFrame(step);
      }
    }, { threshold: 0.3 });
    if (ref.current) observer.observe(ref.current);
    return () => { observer.disconnect(); if (rafId.current) cancelAnimationFrame(rafId.current); };
  }, [end, duration]);

  return [count, ref];
}

// Only figures the product catalogue actually supports. The previous set
// ('500+ clinics served', '1200+ chairs installed', '45+ cities') was invented
// for a company established in January 2023.
const STATS = [
  { value: COMPANY_DETAILS.experienceYears, label: "Founder's years in the industry" },
  { value: '5', label: 'Dental chair models' },
  { value: '8', label: 'Equipment categories' },
  { value: '6', label: 'Service offerings' },
];

function Stat({ value, label }) {
  const [display, ref] = useCountUp(value);
  return (
    <div ref={ref} className="flex flex-col gap-1">
      <span className="text-5xl sm:text-6xl font-medium tracking-tighter text-white leading-none">
        {display || value}
      </span>
      <span className="text-xs text-white/40 uppercase tracking-wide mt-2">{label}</span>
    </div>
  );
}

/* ── Component ─────────────────────────────────────────── */
export default function AboutSection() {
  const parallaxRef = useParallax(0.05);

  return (
    <section className="relative z-3 py-20 bg-white overflow-hidden">
      <div ref={parallaxRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 will-change-transform w-full">
        <Reveal>
          <div className="relative bg-blue-950 rounded-[2rem] overflow-hidden">

            {/* Concentric circles pattern */}
            <svg
              className="absolute -right-32 top-1/2 -translate-y-1/2 w-[500px] h-[500px] sm:w-[800px] sm:h-[800px] pointer-events-none mask-[linear-gradient(to_right,transparent,black_40%)]"
              viewBox="0 0 800 800"
              fill="none"
            >
              {[60, 100, 140, 180, 220, 260, 300, 340, 380, 420, 460, 500, 540].map((r, i) => (
                <circle
                  key={r}
                  cx="400"
                  cy="400"
                  r={r}
                  stroke="white"
                  strokeOpacity={0.12 - i * 0.01}
                  strokeWidth="1"
                />
              ))}
            </svg>

            {/* Glassmorphism blur glow */}
            <div className="absolute inset-x-0 bottom-0 h-40 pointer-events-none">
              <div className="absolute -bottom-16 right-0 w-[400px] h-[400px] bg-cyan-500/20 rounded-full blur-[80px]" />
              <div className="absolute -bottom-20 right-1/4 w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-[80px]" />
              <div className="absolute inset-0 backdrop-blur-xl mask-[linear-gradient(to_top,black,transparent)]" />
            </div>

            {/* Top: header row */}
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-6 px-10 pt-10 pb-0">
              <div>
                <span className="block text-xs uppercase tracking-widest text-cyan-400 font-medium mb-3">
                  About Care Dent
                </span>
                <h2 className="text-3xl sm:text-4xl font-medium tracking-tighter text-white leading-[1.1] max-w-md">
                  Dental equipment solutions, built around your practice.
                </h2>
              </div>
              <Link
                to="/about"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-cyan-400 hover:text-cyan-300 transition-colors shrink-0 mb-2"
              >
                Our Story <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Divider */}
            <div className="relative z-10 border-t border-white/10 mx-10 mt-10" />

            {/* Bottom: stats */}
            <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-8 px-10 py-12">
              {STATS.map((s) => <Stat key={s.label} value={s.value} label={s.label} />)}
            </div>

          </div>
        </Reveal>
      </div>
    </section>
  );
}