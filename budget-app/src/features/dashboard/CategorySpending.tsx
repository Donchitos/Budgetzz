// src/features/dashboard/CategorySpending.tsx
import React from 'react';
import { useDashboardData } from './useDashboardData';
import Card from '../../components/Card';
import './CategorySpending.css';

const CategorySpending: React.FC = () => {
  const { categorySpending, loading } = useDashboardData();

  const getStatusColor = (amount: number, budget: number) => {
    if (budget === 0) return 'color-gray';
    const percentage = (amount / budget) * 100;
    if (percentage > 100) return 'color-red';
    if (percentage > 90) return 'color-yellow';
    return 'color-green';
  };

  return (
    <Card>
      <h3 className="card-title">Spending by Category</h3>
      {loading && <p>Loading...</p>}
      {categorySpending && (
        <div className="category-spending-list">
          {categorySpending.map((item, index) => {
            const difference = item.amount - item.budget;
            const statusColor = getStatusColor(item.amount, item.budget);

            return (
              <div key={index} className="category-spending-item">
                <div className="category-info">
                  <span
                    className={`category-dot ${statusColor}`}
                    style={{ backgroundColor: item.color }}
                  ></span>
                  <span className="category-name">{item.category}</span>
                </div>
                <div className="category-amount">
                  <span className="amount-spent">${item.amount.toLocaleString()}</span>
                  <span className={`amount-budget ${difference > 0 ? 'over-budget' : 'under-budget'}`}>
                    {difference > 0 ? '+' : ''}${difference.toLocaleString()} vs budget
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
};

export default CategorySpending;