import { Link } from 'react-router-dom';
import { ArrowUpRight, Clock, BookOpen } from 'lucide-react';
import { sortedArticles } from '../data/articles';
import Reveal from '../components/Reveal';
import Seo from '../components/Seo';
import Breadcrumbs from '../components/Breadcrumbs';
import { metaFor } from '../lib/pageMeta';
import { breadcrumbSchema, articleListSchema } from '../lib/seo';

// Declared once: the same array feeds the visible breadcrumb and the
// BreadcrumbList markup, so the two can never disagree.
const BREADCRUMB_TRAIL = [{ name: 'Home', path: '/' }, { name: 'Guides', path: '/guides' }];

export default function Guides() {
  const articles = sortedArticles();

  return (
    <div className="min-h-screen bg-white text-slate-800">
      <Seo
        {...metaFor('/guides')}
        schema={[
          breadcrumbSchema(BREADCRUMB_TRAIL),
          articleListSchema(articles),
        ]}
      />

      <section className="relative overflow-hidden bg-blue-950 text-white page-hero">
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none mix-blend-screen transform -translate-y-1/2 translate-x-1/4" />
        <div className="relative container-page max-w-4xl text-center">
          <Reveal>
            <Breadcrumbs trail={BREADCRUMB_TRAIL} />
            <span className="block text-xs uppercase tracking-widest text-cyan-400 mb-6 font-bold">
              Guides
            </span>
            <h1 className="text-4xl sm:text-5xl tracking-tighter font-medium leading-[1.1]">
              What we have learned, written down
            </h1>
          </Reveal>
          <Reveal delay={100}>
            <p className="text-slate-400 text-base leading-relaxed tracking-tight max-w-2xl mx-auto mt-6">
              Practical guidance on buying, installing and maintaining dental equipment —
              drawn from what our engineers see in clinics, not from brochures.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="section-y">
        <div className="container-page max-w-5xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {articles.map((article, idx) => (
              <Reveal key={article.slug} delay={idx * 70} y={28} x={-16}>
                <Link
                  to={`/guides/${article.slug}`}
                  className="group h-full flex flex-col bg-neutral-100 border border-neutral-200 rounded-2xl p-7 space-y-4 hover:border-cyan-200 hover:bg-white hover:shadow-xl hover:shadow-cyan-900/5 transition-all duration-500"
                >
                  {/* Top meta row */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase tracking-normal text-neutral-700 bg-white border border-neutral-300 px-2.5 py-1 rounded-full">
                      {article.category}
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-sm text-slate-400 tracking-tight">
                      <Clock className="w-3.5 h-3.5" />
                      {article.readingMinutes} min
                    </span>
                  </div>
                  {/* Title */}
                  <h2 className="text-lg font-medium tracking-tight text-slate-900 leading-snug flex-grow">{article.title}</h2>
                  {/* Summary */}
                  <p className="text-sm text-slate-500 leading-relaxed tracking-tight">{article.summary}</p>
                  {/* CTA */}
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-tight text-cyan-700 group-hover:gap-2.5 transition-all duration-300 pt-1">
                    <span>Read the guide</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>

          <Reveal delay={200} y={20}>
            <div className="mt-12 bg-blue-950 rounded-2xl px-8 py-9 flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div className="w-11 h-11 rounded-xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center shrink-0">
                <BookOpen className="w-5 h-5" />
              </div>
              <div className="flex-grow">
                <h3 className="font-medium tracking-tight text-white">Planning a new clinic?</h3>
                <p className="text-sm text-slate-400 mt-1 tracking-tight leading-relaxed">
                  The setup guide walks through the whole sequence — from architectural decisions to equipment installation, in the exact order it happens.
                </p>
              </div>
              <Link
                to="/dental-clinic-setup"
                className="inline-flex items-center gap-2 rounded-full bg-cyan-600 hover:bg-cyan-500 text-white font-medium tracking-tight text-sm px-5 py-2.5 transition-colors shrink-0"
              >
                <span>Read it</span>
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
