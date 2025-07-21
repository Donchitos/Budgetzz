import React from 'react';
import Button from '../../components/Button';
import type { Budget } from '../../types';
import { useBudget } from './useBudget';

interface BudgetListProps {
  budgets: Budget[];
  selectedPeriod: Date;
}

const BudgetList: React.FC<BudgetListProps> = ({ budgets, selectedPeriod }) => {
  const { loading, handleDeleteBudget } = useBudget(selectedPeriod);

  return (
    <ul className="budget-list">
      {budgets.map((budget) => (
        <li key={budget.id} className="budget-item">
          <div>
            <span className="category">{budget.category}</span>
            <span className="amount">
              ${budget.budgetAmount.toFixed(2)}
            </span>
          </div>
          <Button
            onClick={() => {
              if (window.confirm(`Are you sure you want to delete the ${budget.category} budget?`)) {
                handleDeleteBudget(budget.id);
              }
            }}
            variant="destructive"
            className="delete-button btn-delete"
            disabled={loading}
          >
            Delete
          </Button>
        </li>
      ))}
    </ul>
  );
};

export default BudgetList;