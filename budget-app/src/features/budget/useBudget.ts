// Fixed useBudget.ts - corrected month filtering logic
import { useState, useMemo } from 'react';
import { setBudget, deleteBudget } from '../../services/api';
import useFirestoreCollection from '../../hooks/useFirestoreCollection';
import type { Budget } from '../../types';

export const useBudget = (selectedPeriod: Date) => {
  const { snapshot, loading: collectionLoading, error: collectionError } = useFirestoreCollection('budgets');
  const [category, setCategory] = useState('Food');
  const [budgetAmount, setBudgetAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const budgets = useMemo(() => {
    if (!snapshot) return [];
    
    // FIX: Use 0-based months to match how they're stored in the database
    const month = selectedPeriod.getMonth(); // 0-based (August = 7)
    const year = selectedPeriod.getFullYear();
    
    return snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() } as Budget))
      .filter(budget => budget.month === month && budget.year === year);
  }, [snapshot, selectedPeriod]);

  const handleSetBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(budgetAmount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Please enter a valid budget amount.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await setBudget(category, parsedAmount, selectedPeriod);
      setBudgetAmount('');
    } catch (err) {
      console.error('Error setting budget: ', err);
      setError('Error setting budget. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBudget = async (budgetId: string) => {
    setLoading(true);
    setError(null);

    try {
      await deleteBudget(budgetId);
    } catch (err) {
      console.error('Error deleting budget: ', err);
      setError('Error deleting budget. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return {
    budgets,
    category,
    setCategory,
    budgetAmount,
    setBudgetAmount,
    loading: loading || collectionLoading,
    error: error || collectionError?.message || null,
    handleSetBudget,
    handleDeleteBudget,
  };
};