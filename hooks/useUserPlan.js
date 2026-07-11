// hooks/useUserPlan.js
import { useState, useEffect } from 'react';

export function useUserPlan() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [plan, setPlan] = useState({
    plan: 'free',
    planName: 'Free',
    isActive: true,
    hasSubscription: false,
    expiresAt: null,
    billingCycle: null,
    features: [],
  });

  useEffect(() => {
    fetchUserPlan();
  }, []);

  const fetchUserPlan = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/user/plan');
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch plan');
      }

      if (result.success) {
        setPlan(result.data);
      } else {
        throw new Error(result.error || 'Failed to load plan');
      }
    } catch (err) {
      console.error('Error fetching user plan:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { plan, loading, error, refetch: fetchUserPlan };
}