import { useTransactions } from '../../hooks/useTransactions';
import useFirestoreCollection from '../../hooks/useFirestoreCollection';
import type { RecurringTransaction } from '../../types';

export const useDashboardData = () => {
  const { balance, loading: balanceLoading } = useTransactions(new Date());
  const { snapshot: recurringSnapshot, loading: recurringLoading } = useFirestoreCollection('recurring-transactions');

  const allRecurring = recurringSnapshot?.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  } as RecurringTransaction)) || [];

  const loading = balanceLoading || recurringLoading;

  return { balance, allRecurring, loading };
};