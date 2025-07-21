import { useState, useEffect } from 'react';
import { calculateBalanceProjection } from '../utils/projectionUtils';
import type { RecurringTransaction } from '../types';

interface ProjectionPoint {
  date: Date;
  balance: number;
  transactions: RecurringTransaction[];
}

export const useBalanceProjection = (
  currentBalance: number,
  recurringTransactions: RecurringTransaction[],
  daysToProject: number
) => {
  const [projection, setProjection] = useState<ProjectionPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentBalance !== undefined && recurringTransactions.length > 0) {
      const data = calculateBalanceProjection(currentBalance, recurringTransactions, daysToProject);
      setProjection(data);
      setLoading(false);
    }
  }, [currentBalance, recurringTransactions, daysToProject]);

  return { projection, loading };
};