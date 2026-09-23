import { useState, useEffect } from 'react';
import useFetch from '../../hooks/useFetch';

/**
 * Non-component pieces shared across the admin screens.
 *
 * Kept out of shared.jsx so that module exports components and nothing else -
 * mixing the two breaks Fast Refresh for every screen that imports it.
 */

/** Shared list state: search box + reload, wired to an admin endpoint. */
function useAdminList(endpoint, deps = []) {
  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setDebounced(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const state = useFetch(
    (signal) => endpoint({ q: debounced || undefined, limit: 100 }, { signal }),
    [debounced, ...deps]
  );

  return { ...state, search, setSearch, items: state.data?.data || [] };
}


/** Mongo dates arrive as ISO strings; <input type="date"> wants YYYY-MM-DD. */
function dateInput(value) {
  if (!value) return '';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 10);
}

/** Stock level as a colour: out, low, or healthy against the product's own threshold. */
function stockTone(product) {
  if (product.stock <= 0) return 'text-red-400';
  if (product.stock <= (product.lowStockThreshold ?? 2)) return 'text-amber-400';
  return 'text-emerald-400';
}


export { useAdminList, dateInput, stockTone };
