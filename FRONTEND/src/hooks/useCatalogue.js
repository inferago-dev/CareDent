import { useState, useEffect } from 'react';
import { catalogApi } from '../lib/api';
import { DENTAL_CHAIRS, OTHER_EQUIPMENT } from '../data/products';

/**
 * Shared, cached catalogue for the surfaces that only need a product list:
 * the navbar mega-menu, the home flagship section and the quote modal.
 *
 * Fetched once per page load and memoised at module scope, so mounting three
 * consumers costs one request instead of three. Falls back to the bundled
 * catalogue if the API is unreachable, which keeps the marketing site intact.
 */

const FALLBACK = {
  chairs: DENTAL_CHAIRS.map((c) => ({ ...c, _id: c.id, kind: 'chair' })),
  equipment: OTHER_EQUIPMENT.map((e) => ({
    ...e, _id: e.id, kind: 'equipment', slug: e.slug || e.id, heroImage: e.image,
  })),
  live: false,
};

let cache = null;

function load() {
  if (cache) return cache;
  cache = catalogApi
    .list({ limit: 100 })
    .then((res) => {
      const items = res?.data || [];
      if (!items.length) return FALLBACK;
      return {
        chairs: items.filter((p) => p.kind === 'chair'),
        equipment: items.filter((p) => p.kind !== 'chair'),
        live: true,
      };
    })
    .catch(() => FALLBACK);
  return cache;
}

export default function useCatalogue() {
  // Start from the bundled data so nothing flashes empty on first paint.
  const [data, setData] = useState(FALLBACK);

  useEffect(() => {
    let active = true;
    load().then((result) => { if (active) setData(result); });
    return () => { active = false; };
  }, []);

  return data;
}

/** Test/debug helper: drop the memoised catalogue so the next mount refetches. */
export function resetCatalogueCache() {
  cache = null;
}
