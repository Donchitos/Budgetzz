// src/features/reports/CategoryBreakdown.tsx
import React, { useMemo } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import type { Transaction, ComparisonMode } from '../../types';

ChartJS.register(ArcElement, Tooltip, Legend);

interface CategoryBreakdownProps {
  currentExpenses: Transaction[];
  previousExpenses: Transaction[];
  comparison: ComparisonMode;
}

const CategoryBreakdown: React.FC<CategoryBreakdownProps> = ({ currentExpenses, previousExpenses, comparison }) => {
  const { chartData, categoryDetails } = useMemo(() => {
    const aggregateExpenses = (expenses: Transaction[]) => {
      const categories: { [key: string]: number } = {};
      expenses.forEach((expense) => {
        const category = expense.category || 'Uncategorized';
        categories[category] = (categories[category] || 0) + expense.amount;
      });
      return categories;
    };

    const currentCategories = aggregateExpenses(currentExpenses);
    const previousCategories = aggregateExpenses(previousExpenses);

    const labels = Object.keys(currentCategories);
    const data = Object.values(currentCategories);

    const categoryDetails = labels.map(label => {
      const currentAmount = currentCategories[label];
      const previousAmount = previousCategories[label] || 0;
      let percentageChange: number | null = null;
      if (comparison !== 'none' && previousAmount > 0) {
        percentageChange = ((currentAmount - previousAmount) / previousAmount) * 100;
      }
      return {
        label,
        currentAmount,
        previousAmount,
        percentageChange,
      };
    });

    const chartData = {
      labels: labels,
      datasets: [
        {
          label: 'Expenses by Category',
          data,
          backgroundColor: [
            'rgba(255, 99, 132, 0.7)',
            'rgba(54, 162, 235, 0.7)',
            'rgba(255, 206, 86, 0.7)',
            'rgba(75, 192, 192, 0.7)',
            'rgba(153, 102, 255, 0.7)',
            'rgba(255, 159, 64, 0.7)',
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)',
          ],
          borderWidth: 1,
        },
      ],
    };

    return { chartData, categoryDetails };
  }, [currentExpenses, previousExpenses, comparison]);

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Spending Breakdown by Category',
      },
    },
  };

  return (
    <div>
      <Doughnut data={chartData} options={options} />
      <div style={{ marginTop: '20px' }}>
        <h4>Category Details</h4>
        <ul>
          {categoryDetails.map(detail => (
            <li key={detail.label}>
              <strong>{detail.label}:</strong> ${detail.currentAmount.toFixed(2)}
              {detail.percentageChange !== null && (
                <span style={{ color: detail.percentageChange >= 0 ? 'green' : 'red', marginLeft: '10px' }}>
                  ({detail.percentageChange.toFixed(1)}%)
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default CategoryBreakdown;