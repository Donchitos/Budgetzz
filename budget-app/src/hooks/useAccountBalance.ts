import { useMemo } from 'react';
import useFirestoreCollection from './useFirestoreCollection';
import type { Transaction } from '../types';

export const useAccountBalance = () => {
  const { snapshot: incomeSnapshot, loading: incomeLoading, error: incomeError } = useFirestoreCollection('income');
  const { snapshot: expensesSnapshot, loading: expensesLoading, error: expensesError } = useFirestoreCollection('expenses');

  const income = useMemo(() => {
    if (!incomeSnapshot) return [];
    return incomeSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as Transaction));
  }, [incomeSnapshot]);

  const expenses = useMemo(() => {
    if (!expensesSnapshot) return [];
    return expensesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as Transaction));
  }, [expensesSnapshot]);

  const totalIncome = useMemo(
    () => income.reduce((sum, item) => sum + item.amount, 0),
    [income]
  );

  const totalExpenses = useMemo(
    () => expenses.reduce((sum, item) => sum + item.amount, 0),
    [expenses]
  );

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