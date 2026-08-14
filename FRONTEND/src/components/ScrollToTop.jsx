import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * React Router keeps the scroll position between routes, which lands you
 * halfway down a fresh page. Reset it on every navigation.
 */
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
  }, [pathname]);

  return null;
}
