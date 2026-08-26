import { ArrowRight } from 'lucide-react';
import Reveal from '../Reveal';
import useParallax from '../../hooks/useParallax';

export default function CtaSection({ onOpenQuoteModal }) {
  const parallaxRef = useParallax(0.08);

  return (
    <section className="relative z-7 pt-10 section-pb bg-white overflow-hidden">
      <div className="relative rounded-3xl mx-10 bg-blue-950 text-white overflow-hidden w-full">

        {/* Concentric circles pattern — decorative, low opacity */}
        <svg
          className="absolute -right-24 -top-24 sm:-right-16 sm:-top-32 w-[520px] h-[520px] sm:w-[620px] sm:h-[620px] pointer-events-none"
          viewBox="0 0 600 600"
          fill="none"
        >
          {[60, 110, 160, 210, 260, 310, 360].map((r, i) => (
            <circle
              key={r}
              cx="300"
              cy="300"
              r={r}
              stroke="white"
              strokeOpacity={0.12 - i * 0.006}
              strokeWidth="1"
            />
          ))}
        </svg>

        {/* Glassmorphism blur — lower portion */}
        <div className="absolute inset-x-0 bottom-0 h-40 pointer-events-none">
          <div className="absolute -bottom-16 left-1/4 w-72 h-72 bg-cyan-500/30 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 right-1/4 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl" />
          <div className="absolute inset-0 backdrop-blur-2xl mask-[linear-gradient(to_top,black,transparent)]" />
        </div>

        <div ref={parallaxRef} className="relative container-page max-w-3xl py-12 text-center space-y-6 will-change-transform">
          <Reveal>
            <h2 className="text-3xl sm:text-4xl tracking-tighter font-medium leading-[1.1]">
              Tell us about your clinic. We will tell you what it needs.
            </h2>
          </Reveal>
          <Reveal delay={100}>
            <p className="text-slate-400 text-base max-w-xl mx-auto">
              Send us your room size and what you need. You get a written quotation,
              a free site check before anything is delivered, and the name of the
              engineer who will install it. No cost, no obligation.
            </p>
          </Reveal>
          <Reveal delay={200}>
            <div className="pt-2">
              <button
                onClick={() => onOpenQuoteModal()}
                className="inline-flex items-center gap-2 rounded-full bg-white text-blue-950 font-medium text-sm px-3 ps-5 py-2.5 hover:bg-cyan-50 transition-colors"
              >
                <span>Get A Quotation</span>
                <ArrowRight className="w-8 h-8 rounded-full bg-blue-950 p-2 text-white" />
              </button>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}