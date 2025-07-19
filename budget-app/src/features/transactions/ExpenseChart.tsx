import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import type { Transaction } from "../../types";
import Card from "../../components/Card";
import "./ExpenseChart.css";

ChartJS.register(ArcElement, Tooltip, Legend);

interface ExpenseChartProps {
  expenses: Transaction[];
  periodLabel?: string;
}

const chartColors = [
  '#2ECC71', '#3498DB', '#F1C40F', '#E74C3C', '#9B59B6',
  '#34495E', '#1ABC9C', '#E67E22', '#27AE60', '#2980B9'
];

function ExpenseChart({ expenses, periodLabel }: ExpenseChartProps) {
  const processChartData = () => {
    const categories: { [key: string]: number } = {};

    expenses.forEach((expense) => {
      const category = expense.category || "Uncategorized";
      categories[category] = (categories[category] || 0) + expense.amount;
    });

    const categoryNames = Object.keys(categories);
    const categoryValues = Object.values(categories);

    return {
      labels: categoryNames,
      datasets: [
        {
          label: "Expenses",
          data: categoryValues,
          backgroundColor: chartColors.slice(0, categoryNames.length),
          borderWidth: 2,
        },
      ],
    };
  };

  const chartData = processChartData();
  const totalExpenses = chartData.datasets[0].data.reduce((sum, value) => sum + value, 0);
  const hasData = totalExpenses > 0;

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: { padding: 20, usePointStyle: true, font: { size: 12 } },
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            const value = context.parsed;
            const percentage = ((value / totalExpenses) * 100).toFixed(1);
            return `${context.label}: $${value.toFixed(2)} (${percentage}%)`;
          },
        },
      },
    },
  };

  return (
    <Card title={`Spending Breakdown${periodLabel ? ` - ${periodLabel}` : ""}`}>
      <div className="expense-chart-container">
        {hasData ? (
          <>
            <div className="chart-wrapper">
              <Pie data={chartData} options={options} />
            </div>
            <div className="total-summary">
              <div className="label">Total Expenses</div>
              <div className="amount">${totalExpenses.toFixed(2)}</div>
              <div className="count">
                {chartData.labels.length} categor{chartData.labels.length !== 1 ? "ies" : "y"}
              </div>
            </div>
          </>
        ) : (
          <div className="no-data-placeholder">
            <div className="icon">📊</div>
            <div className="title">No expenses to display</div>
            <div className="subtitle">Add some expenses to see your spending breakdown</div>
          </div>
        )}
      </div>
    </Card>
  );
}

export default ExpenseChart;