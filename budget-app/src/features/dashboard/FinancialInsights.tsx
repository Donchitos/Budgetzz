import React from 'react';
import type { Budget, Transaction } from '../../types';
import { differenceInDays, endOfMonth } from 'date-fns';
import Card from '../../components/Card';
import './FinancialInsights.css';

interface FinancialInsightsProps {
  budgets: Budget[];
  expenses: Transaction[];
  totalIncome: number;
}

const FinancialInsights: React.FC<FinancialInsightsProps> = ({ budgets, expenses, totalIncome }) => {
  const totalBudget = budgets.reduce((sum, b) => sum + b.budgetAmount, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  const budgetUsage = totalBudget > 0 ? (totalExpenses / totalBudget) * 100 : 0;
  
  const today = new Date();
  const endOfMonthDate = endOfMonth(today);
  const daysLeft = differenceInDays(endOfMonthDate, today);

  const dailySpendRate = totalExpenses / today.getDate();
  const projectedSpending = dailySpendRate * endOfMonthDate.getDate();

  const getInsightMessage = () => {
    if (budgetUsage > 100) {
      return {
        message: "You're over budget!",
        className: "negative",
      };
    }
    if (budgetUsage > 80) {
      return {
        message: "You're close to your budget limit.",
        className: "warning",
      };
    }
    return {
      message: "You're on track with your budget.",
      className: "positive",
    };
  };

  const insight = getInsightMessage();

  return (
    <Card title="Instant Financial Insights">
      <div className="financial-insights">
        <div className={`insight-message ${insight.className}`}>
          {insight.message}
        </div>
        <div className="insight-grid">
          <div className="insight-item">
            <div className="label">Budget Usage</div>
            <div className="value">{budgetUsage.toFixed(1)}%</div>
          </div>
          <div className="insight-item">
            <div className="label">Days Until Month End</div>
            <div className="value">{daysLeft}</div>
          </div>
          <div className="insight-item">
            <div className="label">Projected Spending</div>
            <div className="value">${projectedSpending.toFixed(2)}</div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default FinancialInsights;