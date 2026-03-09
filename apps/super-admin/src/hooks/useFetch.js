import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Custom hook for data fetching with loading and error states.
 *
 * @param {Function} fetchFn - Async function that returns data. Wrap in useCallback
 *   or pass a stable reference to avoid re-fetching on every render.
 * @param {Array} deps - Dependency array that triggers a re-fetch when changed.
 * @param {Object} options - Options (initialData, skip)
 */
export const useFetch = (fetchFn, deps = [], options = {}) => {
  const {
    initialData = null,
    skip = false,
  } = options;

  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(!skip && initialData === null);
  const [error, setError] = useState(null);
  const mountedRef = useRef(true);

  // Store fetchFn in a ref so the effect doesn't re-run when the function identity changes
  const fetchFnRef = useRef(fetchFn);
  fetchFnRef.current = fetchFn;

  const refetch = useCallback(async () => {
    if (skip) return;

    try {
      setLoading(true);
      setError(null);
      const result = await fetchFnRef.current();
      if (mountedRef.current) {
        setData(result);
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err?.message || 'Failed to fetch data');
        if (import.meta.env.DEV) {
          console.error('Fetch error:', err);
        }
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [skip]);

  useEffect(() => {
    mountedRef.current = true;
    if (!skip) {
      refetch();
    }
    return () => {
      mountedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, skip]);

  return {
    data,
    loading,
    error,
    refetch,
    setData,
  };
};

export default useFetch;
