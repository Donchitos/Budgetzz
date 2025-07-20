import { useState } from 'react';
import { setBudget, deleteBudget } from '../../services/api';

export const useBudget = (selectedPeriod: Date) => {
  const [category, setCategory] = useState('Food');
  const [budgetAmount, setBudgetAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    category,
    setCategory,
    budgetAmount,
    setBudgetAmount,
    loading,
    error,
    handleSetBudget,
    handleDeleteBudget,
  };
};