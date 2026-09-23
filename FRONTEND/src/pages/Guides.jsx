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
            <p className="text-slate-400 text-base leading-relaxed max-w-2xl mx-auto mt-6">
              Practical guidance on buying, installing and maintaining dental equipment —
              drawn from what our engineers see in clinics, not from brochures.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="section-y">
        <div className="container-page max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {articles.map((article, idx) => (
              <Reveal key={article.slug} delay={idx * 80} y={24}>
                <Link
                  to={`/guides/${article.slug}`}
                  className="group h-full flex flex-col bg-white border border-slate-200 rounded-2xl p-7 space-y-4 hover:border-cyan-200 hover:shadow-xl hover:shadow-cyan-900/5 transition-all duration-500"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-widest text-cyan-700">
                      {article.category}
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-xs text-slate-400">
                      <Clock className="w-3.5 h-3.5" />
                      {article.readingMinutes} min
                    </span>
                  </div>
                  <h2 className="text-lg font-medium text-slate-900 leading-snug">{article.title}</h2>
                  <p className="text-sm text-slate-500 leading-relaxed flex-grow">{article.summary}</p>
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-700 group-hover:gap-2.5 transition-all">
                    <span>Read the guide</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>

          <Reveal delay={200}>
            <div className="mt-14 bg-slate-50 border border-slate-200 rounded-2xl p-8 flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div className="w-11 h-11 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center shrink-0">
                <BookOpen className="w-5 h-5" />
              </div>
              <div className="flex-grow">
                <h3 className="font-medium text-slate-900">Planning a new clinic?</h3>
                <p className="text-sm text-slate-500 mt-1">
                  The setup guide walks through the whole sequence, in the order it happens.
                </p>
              </div>
              <Link
                to="/dental-clinic-setup"
                className="inline-flex items-center gap-2 rounded-full bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-sm px-5 py-2.5 transition-colors shrink-0"
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
