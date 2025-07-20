import React from 'react';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { useBudget } from './useBudget';
import type { Budget } from '../../types';

const categories = [
  "Food",
  "Transport",
  "Housing",
  "Utilities",
  "Entertainment",
  "Other",
];

interface BudgetFormProps {
  selectedPeriod: Date;
  budgets: Budget[];
}

const BudgetForm: React.FC<BudgetFormProps> = ({ selectedPeriod, budgets }) => {
  const {
    category,
    setCategory,
    budgetAmount,
    setBudgetAmount,
    loading,
    error,
    handleSetBudget,
  } = useBudget(selectedPeriod);

  const existingBudget = budgets.some((b) => b.category === category);

  const handleSubmit = (e: React.FormEvent) => {
    handleSetBudget(e);
  };

  return (
    <form onSubmit={handleSubmit} className="budget-manager-form">
      <select value={category} onChange={(e) => setCategory(e.target.value)}>
        {categories.map((cat) => (
          <option key={cat} value={cat}>
            {cat}
          </option>
        ))}
      </select>
      <Input
        type="number"
        value={budgetAmount}
        onChange={(e) => setBudgetAmount(e.target.value)}
        placeholder="Budget Amount"
        required
        step="0.01"
        min="0"
      />
      <Button type="submit" disabled={loading}>
        {loading ? "Saving..." : existingBudget ? "Update Budget" : "Set Budget"}
      </Button>
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </form>
  );
};

export default BudgetForm;