import { Link } from 'react-router-dom';

/**
 * The visible half of a page's breadcrumb.
 *
 * Every public page already emitted BreadcrumbList structured data, but only
 * the product page showed a breadcrumb - so for the rest we were describing
 * navigation to Google that a visitor could not see. Google asks that
 * marked-up breadcrumbs correspond to something on the page, and treats a
 * mismatch as markup that does not reflect the content.
 *
 * Pages declare the trail once and pass the same array to both this component
 * and `breadcrumbSchema()`, so the two cannot drift:
 *
 *   const TRAIL = [{ name: 'Home', path: '/' }, { name: 'Services', path: '/services' }];
 *   <Seo {...metaFor('/services')} schema={breadcrumbSchema(TRAIL)} />
 *   <Breadcrumbs trail={TRAIL} />
 *
 * The last crumb is the current page, so it renders as text rather than a link
 * to itself.
 */
export default function Breadcrumbs({ trail = [], align = 'left', className = '' }) {
  if (trail.length < 2) return null;

  return (
    <nav
      aria-label="Breadcrumb"
      className={`text-xs text-slate-400 mb-5 ${align === 'center' ? 'flex justify-center' : ''} ${className}`}
    >
      <ol className="flex items-center gap-2 flex-wrap min-w-0">
        {trail.map((crumb, i) => {
          const isCurrent = i === trail.length - 1;
          return (
            <li key={crumb.path} className="flex items-center gap-2 min-w-0">
              {i > 0 && <span aria-hidden="true" className="text-slate-600">/</span>}
              {isCurrent ? (
                <span aria-current="page" className="text-slate-300 truncate">{crumb.name}</span>
              ) : (
                <Link to={crumb.path} className="hover:text-cyan-400 transition-colors">
                  {crumb.name}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
