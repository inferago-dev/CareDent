import { useState, useEffect, useCallback } from 'react';

/**
 * Small data-fetching hook for the API client.
 *
 *   const { data, loading, error, reload } = useFetch(
 *     (signal) => catalogApi.list({ q }, { signal }),
 *     [q]
 *   );
 *
 * Aborts the in-flight request when deps change or the component unmounts,
 * so a slow response can never overwrite a newer one.
 */
export default function useFetch(fetcher, deps = [], { enabled = true, initialData = null } = {}) {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState(null);
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    if (!enabled) return undefined;

    const controller = new AbortController();
    let active = true;

    // Entering the loading state IS the side effect here: it is what starting
    // a request looks like, and nothing in props can derive it until the
    // response lands.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    setError(null);

    Promise.resolve(fetcher(controller.signal))
      .then((res) => { if (active) setData(res); })
      .catch((err) => { if (active && err.name !== 'AbortError') setError(err); })
      .finally(() => { if (active) setLoading(false); });

    return () => {
      active = false;
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, enabled, nonce]);

  const reload = useCallback(() => setNonce((n) => n + 1), []);

  return { data, loading, error, reload, setData };
}
