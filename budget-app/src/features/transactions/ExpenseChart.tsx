import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import type { Transaction } from "../../types";

ChartJS.register(ArcElement, Tooltip, Legend);

interface ExpenseChartProps {
  expenses: Transaction[];
  periodLabel?: string;
}

function ExpenseChart({ expenses, periodLabel }: ExpenseChartProps) {
  const processChartData = () => {
    const categories: { [key: string]: number } = {};

    expenses.forEach((expense) => {
      const category = expense.category || "Uncategorized";
      const amount = expense.amount;
      if (categories[category]) {
        categories[category] += amount;
      } else {
        categories[category] = amount;
      }
    });

    const colors = [
      "rgba(255, 99, 132, 0.7)",
      "rgba(54, 162, 235, 0.7)",
      "rgba(255, 206, 86, 0.7)",
      "rgba(75, 192, 192, 0.7)",
      "rgba(153, 102, 255, 0.7)",
      "rgba(255, 159, 64, 0.7)",
      "rgba(201, 203, 207, 0.7)",
      "rgba(255, 99, 255, 0.7)",
      "rgba(99, 255, 132, 0.7)",
      "rgba(132, 99, 255, 0.7)",
    ];

    const borderColors = colors.map((color) => color.replace("0.7", "1"));

    const categoryNames = Object.keys(categories);
    const categoryValues = Object.values(categories);

    const data = {
      labels: categoryNames.map(
        (name) => `${name} ($${categories[name].toFixed(2)})`
      ),
      datasets: [
        {
          label: "Expenses by Category",
          data: categoryValues,
          backgroundColor: colors.slice(0, categoryNames.length),
          borderColor: borderColors.slice(0, categoryNames.length),
          borderWidth: 2,
        },
      ],
    };

    return data;
  };

  const chartData = processChartData();
  const totalExpenses = chartData.datasets[0].data.reduce(
    (sum, value) => sum + value,
    0
  );
  const hasData = totalExpenses > 0;

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            const value = context.parsed;
            const percentage = ((value / totalExpenses) * 100).toFixed(1);
            return `${context.dataset.label}: $${value.toFixed(
              2
            )} (${percentage}%)`;
          },
        },
      },
    },
  };

  return (
    <div
      style={{
        maxWidth: "500px",
        margin: "auto",
        padding: "20px",
        backgroundColor: "#f8f9fa",
        borderRadius: "8px",
        border: "1px solid #e9ecef",
      }}
    >
      <h3 style={{ textAlign: "center", marginBottom: "20px" }}>
        Spending Breakdown{periodLabel ? ` - ${periodLabel}` : ""}
      </h3>

      {hasData ? (
        <>
          <div style={{ height: "300px", marginBottom: "20px" }}>
            <Pie data={chartData} options={options} />
          </div>
          <div
            style={{
              textAlign: "center",
              padding: "15px",
              backgroundColor: "#fff",
              borderRadius: "4px",
              border: "1px solid #dee2e6",
            }}
          >
            <div
              style={{
                fontSize: "1.1em",
                color: "#495057",
                marginBottom: "5px",
              }}
            >
              Total Expenses
            </div>
            <div
              style={{
                fontSize: "1.5em",
                fontWeight: "bold",
                color: "#dc3545",
              }}
            >
              ${totalExpenses.toFixed(2)}
            </div>
            <div
              style={{
                fontSize: "0.9em",
                color: "#6c757d",
                marginTop: "5px",
              }}
            >
              {chartData.labels.length} categor
              {chartData.labels.length !== 1 ? "ies" : "y"}
            </div>
          </div>
        </>
      ) : (
        <div
          style={{
            textAlign: "center",
            padding: "40px 20px",
            color: "#6c757d",
          }}
        >
          <div style={{ fontSize: "3em", marginBottom: "10px" }}>📊</div>
          <div style={{ fontSize: "1.1em", marginBottom: "5px" }}>
            No expenses to display
          </div>
          <div style={{ fontSize: "0.9em" }}>
            Add some expenses to see your spending breakdown
          </div>
        </div>
      )}
    </div>
  );
}

export default ExpenseChart;