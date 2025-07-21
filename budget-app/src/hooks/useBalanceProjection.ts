import { useMemo } from 'react';
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
): { projection: ProjectionPoint[]; loading: boolean } => {
  const projection = useMemo(() => {
    if (currentBalance !== undefined && recurringTransactions.length > 0) {
      return calculateBalanceProjection(currentBalance, recurringTransactions, daysToProject);
    }
    return [];
  }, [currentBalance, recurringTransactions, daysToProject]);

  const loading = useMemo(() => {
    return currentBalance === undefined || recurringTransactions.length === 0;
  }, [currentBalance, recurringTransactions]);

  return { projection, loading };
};