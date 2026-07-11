// hooks/useStorage.js
import { useState, useEffect, useCallback } from 'react';

export function useStorage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [storage, setStorage] = useState({
    plan: 'free',
    storageUsed: 0,
    storageLimit: 1,
    remainingStorage: 1,
    percentageUsed: 0,
    isFull: false,
  });

  const fetchStorage = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/user/storage', {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' },
      });
      
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch storage info');
      }

      if (result.success) {
        setStorage(result.data);
      }
    } catch (err) {
      console.error('Error fetching storage:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStorage();
  }, [fetchStorage]);

  return { storage, loading, error, refetch: fetchStorage };
}