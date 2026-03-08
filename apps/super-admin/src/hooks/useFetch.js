import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for data fetching with loading and error states
 * @param {Function} fetchFn - Async function to fetch data
 * @param {Array} deps - Dependency array
 * @param {Object} options - Options (initialData, skip, cache)
 */
export const useFetch = (fetchFn, deps = [], options = {}) => {
  const {
    initialData = null,
    skip = false,
    cacheTime = 5 * 60 * 1000, // 5 minutes
  } = options;

  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(!skip && initialData === null);
  const [error, setError] = useState(null);
  const [lastFetch, setLastFetch] = useState(null);

  const refetch = useCallback(async () => {
    if (skip) return;

    try {
      setLoading(true);
      setError(null);
      const result = await fetchFn();
      setData(result);
      setLastFetch(Date.now());
    } catch (err) {
      setError(err?.message || 'Failed to fetch data');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [fetchFn, skip]);

  useEffect(() => {
    if (skip) return;

    // Check cache validity
    if (lastFetch && Date.now() - lastFetch < cacheTime) {
      return;
    }

    refetch();
  }, [skip, lastFetch, cacheTime, refetch]);

  return {
    data,
    loading,
    error,
    refetch,
    setData,
  };
};

export default useFetch;
