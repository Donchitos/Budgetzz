// src/features/dashboard/FinancialInsights.tsx
import React from 'react';
import { CheckCircle, AlertCircle, Target } from 'lucide-react';
import './FinancialInsights.css';

interface CategorySpending {
  category: string;
  amount: number;
  budget: number;
}

interface FinancialInsightsProps {
  currentExpenses: number;
  lastMonthExpenses: number;
  categorySpending: CategorySpending[];
  savingsGoalProgress: number; // percentage
}

const FinancialInsights: React.FC<FinancialInsightsProps> = ({
  currentExpenses,
  lastMonthExpenses,
  categorySpending,
}) => {
  const expenseChange = ((currentExpenses - lastMonthExpenses) / lastMonthExpenses * 100);
  const overBudgetCategories = categorySpending.filter(cat => cat.amount > cat.budget);
  const biggestOverspend = overBudgetCategories.reduce((max, cat) =>
    (cat.amount - cat.budget) > (max.amount - max.budget) ? cat : max,
    overBudgetCategories[0] || { category: '', amount: 0, budget: 0 }
  );

  const insights = [
    {
      type: 'positive',
      icon: CheckCircle,
      title: 'Positive cash flow',
      description: 'You\'re saving money this month',
    },
    {
      type: expenseChange > 5 ? 'warning' : 'neutral',
      icon: AlertCircle,
      title: `Spending ${expenseChange > 0 ? 'increased' : 'decreased'}`,
      description: `${Math.abs(expenseChange).toFixed(1)}% vs last month`,
    }
  ];

  return (
    <div className="financial-insights">
      <h3 className="financial-insights-title">Financial Health</h3>
      
      <div className="insights-container">
        {insights.map((insight, index) => {
          const Icon = insight.icon;
          return (
            <div key={index} className={`insight-item insight-item-${insight.type}`}>
              <div className="insight-content">
                <Icon className={`insight-icon insight-icon-${insight.type}`} />
                <div>
                  <span className={`insight-title insight-text-${insight.type}`}>{insight.title}</span>
                  <p className={`insight-description insight-text-${insight.type}`}>{insight.description}</p>
                </div>
              </div>
            </div>
          );
        })}

        <div className="tip-box">
          <Target className="tip-icon" />
          <div>
            <p className="tip-title">Smart Tip</p>
            <p className="tip-text">
              {overBudgetCategories.length > 0
                ? `Consider reducing ${biggestOverspend.category} spending by $${Math.ceil((biggestOverspend.amount - biggestOverspend.budget) / 4)} per week to get back on track.`
                : expenseChange > 10
                ? `Your spending increased significantly. Review recent transactions to identify unnecessary expenses.`
                : `You're doing great! Consider increasing your emergency fund contribution by $50 this month.`
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialInsights;