import Reveal from '../Reveal';

/**
 * The equipment brands Care Dent actually supplies and services, taken from
 * the product catalogue. This deliberately does NOT claim client relationships
 * with named hospitals or chains - only brands we stock.
 */
const BRANDS = [
  'Woodpecker',
  'Saeyang Marathon',
  'Dryco Suction',
  'Gamma Series',
  'Beta Series',
  'Alpha Series',
];

export default function TrustedBySection() {
  return (
    <section className="relative z-2 bg-white py-10 border-b border-slate-200">
      <div className="container-page max-w-7xl text-center">
        <Reveal>
          <p className="text-xs uppercase tracking-widest text-slate-400 mb-6">
            Equipment we supply, install and service
          </p>
        </Reveal>
      </div>

      <div className="relative overflow-hidden text-slate-500 mask-[linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
        <div className="flex w-max animate-marquee">
          {[...BRANDS, ...BRANDS].map((name, idx) => (
            <span
              key={`${name}-${idx}`}
              className="inline-flex items-center text-sm font-medium whitespace-nowrap px-8 tracking-tight"
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
