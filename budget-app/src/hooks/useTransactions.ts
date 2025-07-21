import { useMemo } from 'react';
import { collection, addDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../services/firebase';
import { useData } from './useData';
import { isDateInRange, getMonthRange } from '../utils/dateUtils';
import type { Transaction } from '../types';

export const useTransactions = (selectedPeriod: Date) => {
  const { data: income, loading: incomeLoading, error: incomeError } = useData<Transaction>('income');
  const { data: expenses, loading: expensesLoading, error: expensesError } = useData<Transaction>('expenses');

  const dateRange = getMonthRange(selectedPeriod);

  const filteredIncome = useMemo(
    () => income.filter((item) => isDateInRange(item.createdAt, dateRange)),
    [income, dateRange]
  );

  const filteredExpenses = useMemo(
    () => expenses.filter((item) => isDateInRange(item.createdAt, dateRange)),
    [expenses, dateRange]
  );

  const totalIncome = useMemo(
    () => filteredIncome.reduce((sum, item) => sum + item.amount, 0),
    [filteredIncome]
  );

  const totalExpenses = useMemo(
    () => filteredExpenses.reduce((sum, item) => sum + item.amount, 0),
    [filteredExpenses]
  );

  const balance = useMemo(() => totalIncome - totalExpenses, [totalIncome, totalExpenses]);

  const addTransaction = async (
    collectionName: 'income' | 'expenses',
    description: string,
    amount: number,
    category?: string
  ) => {
    if (!auth.currentUser) {
      throw new Error('You must be logged in to add a transaction.');
    }
    await addDoc(collection(db, collectionName), {
      userId: auth.currentUser.uid,
      description,
      amount,
      category,
      createdAt: serverTimestamp(),
    });
  };

  const deleteTransaction = async (collectionName: 'income' | 'expenses', id: string) => {
    try {
      await deleteDoc(doc(db, collectionName, id));
    } catch (error) {
      console.error('Error deleting transaction: ', error);
    }
  };

  return {
    income: filteredIncome,
    expenses: filteredExpenses,
    totalIncome,
    totalExpenses,
    balance,
    loading: incomeLoading || expensesLoading,
    error: incomeError || expensesError,
    addTransaction,
    deleteTransaction,
  };
};