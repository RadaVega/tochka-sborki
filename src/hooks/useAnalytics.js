import { useCallback } from 'react';
import { reachGoal } from '../utils/metrika';

export function useAnalytics() {
  const goal = useCallback((goalName, params = {}) => {
    reachGoal(goalName, params);
  }, []);
  return { goal };
}