import { useParams, Link } from 'react-router-dom';
import { Clock, ChevronLeft, ArrowRight, Info, CheckCircle2 } from 'lucide-react';
import { findArticle, sortedArticles } from '../data/articles';
import { COMPANY_DETAILS } from '../data/products';
import Reveal from '../components/Reveal';
import Seo from '../components/Seo';
import { articleSchema, breadcrumbSchema } from '../lib/seo';
import NotFound from './NotFound';

/** Renders one content block. Types mirror what data/articles.js may contain. */
function Block({ block }) {
  switch (block.type) {
    case 'h2':
      return (
        <h2 className="text-2xl sm:text-3xl tracking-tighter font-medium text-blue-950 leading-snug mt-14 mb-5">
          {block.text}
        </h2>
      );
    case 'list':
      return (
        <ul className="space-y-3 my-6">
          {block.items.map((item) => (
            <li key={item} className="flex items-start gap-3 text-slate-600 leading-relaxed">
              <CheckCircle2 className="w-4 h-4 text-cyan-600 shrink-0 mt-1.5" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      );
    case 'note':
      return (
        <div className="my-8 flex items-start gap-4 bg-cyan-50/60 border border-cyan-100 rounded-2xl p-6">
          <Info className="w-5 h-5 text-cyan-600 shrink-0 mt-0.5" />
          <p className="text-sm text-slate-600 leading-relaxed">{block.text}</p>
        </div>
      );
    case 'p':
    default:
      return <p className="text-slate-600 leading-relaxed my-5">{block.text}</p>;
  }
}

export default function GuideDetail({ onOpenQuoteModal }) {
  const { slug } = useParams();
  const article = findArticle(slug);

  if (!article) return <NotFound />;

  const others = sortedArticles().filter((a) => a.slug !== slug).slice(0, 2);
  const published = new Date(article.publishedAt).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <div className="min-h-screen bg-white text-slate-800">
      <Seo
        type="article"
        title={article.title}
        description={article.summary}
        canonical={`/guides/${article.slug}`}
        schema={[
          articleSchema(article),
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Guides', path: '/guides' },
            { name: article.title, path: `/guides/${article.slug}` },
          ]),
        ]}
      />

      {/* Dark top band: the navbar is fixed and transparent until scroll, so a
          white panel here would hide the white logo. */}
      <section className="relative overflow-hidden bg-blue-950 text-white page-hero">
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none mix-blend-screen transform -translate-y-1/2 translate-x-1/4" />
        <div className="relative container-page max-w-3xl">
          <Link
            to="/guides"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-cyan-400 transition-colors mb-8"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>All guides</span>
          </Link>
          <Reveal>
            <span className="block text-xs uppercase tracking-widest text-cyan-400 mb-5 font-bold">
              {article.category}
            </span>
            <h1 className="text-4xl sm:text-5xl tracking-tighter font-medium leading-[1.1]">
              {article.title}
            </h1>
          </Reveal>
          <Reveal delay={100}>
            <p className="text-slate-400 leading-relaxed mt-6">{article.summary}</p>
          </Reveal>
          <Reveal delay={160}>
            <div className="flex items-center gap-4 text-xs text-slate-500 mt-7">
              <span className="inline-flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                {article.readingMinutes} min read
              </span>
              <span className="text-slate-700">·</span>
              <time dateTime={article.publishedAt}>{published}</time>
            </div>
          </Reveal>
        </div>
      </section>

      <article className="section-y">
        <div className="container-page max-w-3xl">
          {article.body.map((block, idx) => (
            <Block key={`${block.type}-${idx}`} block={block} />
          ))}
        </div>
      </article>

      {/* CTA */}
      <section className="section-pb">
        <div className="container-page max-w-3xl">
          <div className="bg-blue-950 rounded-3xl p-10 text-white text-center space-y-4">
            <h2 className="text-2xl sm:text-3xl tracking-tighter font-medium leading-[1.15]">
              Want this checked against your actual room?
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed max-w-lg mx-auto">
              Send your dimensions and a floor plan. {COMPANY_DETAILS.founder} and the
              engineering team confirm what your site needs — free, before you commit.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Link
                to="/services/pre-installation#request-assessment"
                className="inline-flex items-center gap-2 rounded-full bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-sm px-6 py-3 transition-all active:scale-[0.98]"
              >
                <span>Request Site Assessment</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <button
                onClick={() => onOpenQuoteModal?.()}
                className="inline-flex items-center gap-2 rounded-full border border-white/20 hover:bg-white/5 text-white text-sm px-6 py-3 transition-colors"
              >
                Request a quotation
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* MORE GUIDES */}
      {others.length > 0 && (
        <section className="section-pb">
          <div className="container-page max-w-3xl">
            <h2 className="text-xs uppercase tracking-widest text-slate-400 font-bold mb-6">
              More guides
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {others.map((other) => (
                <Link
                  key={other.slug}
                  to={`/guides/${other.slug}`}
                  className="group bg-white border border-slate-200 rounded-2xl p-6 space-y-2 hover:border-cyan-200 hover:shadow-lg hover:shadow-cyan-900/5 transition-all"
                >
                  <span className="text-xs font-semibold uppercase tracking-widest text-cyan-700">
                    {other.category}
                  </span>
                  <h3 className="font-medium text-slate-900 leading-snug">{other.title}</h3>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
