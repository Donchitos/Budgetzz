import { useMemo } from 'react';
import useFirestoreCollection from './useFirestoreCollection';
import type { Transaction } from '../types';

export const useAccountBalance = () => {
  const { snapshot: incomeSnapshot, loading: incomeLoading, error: incomeError } = useFirestoreCollection('income');
  const { snapshot: expensesSnapshot, loading: expensesLoading, error: expensesError } = useFirestoreCollection('expenses');

  const totalIncome = useMemo(() => {
    if (!incomeSnapshot) return 0;
    return incomeSnapshot.docs.reduce((sum, doc) => sum + (doc.data() as Transaction).amount, 0);
  }, [incomeSnapshot]);

  const totalExpenses = useMemo(() => {
    if (!expensesSnapshot) return 0;
    return expensesSnapshot.docs.reduce((sum, doc) => sum + (doc.data() as Transaction).amount, 0);
  }, [expensesSnapshot]);

  const balance = useMemo(
    () => totalIncome - totalExpenses,
    [totalIncome, totalExpenses]
  );

  return {
    balance,
    loading: incomeLoading || expensesLoading,
    error: incomeError || expensesError,
  };
};