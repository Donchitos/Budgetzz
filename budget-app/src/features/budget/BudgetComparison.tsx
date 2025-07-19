import Card from "../../components/Card";
import type { Budget, Transaction } from "../../types";
import "./Budget.css";

interface BudgetComparisonProps {
  budgets: Budget[];
  expenses: Transaction[];
  periodLabel?: string;
}

function BudgetComparison({
  budgets,
  expenses,
  periodLabel,
}: BudgetComparisonProps) {
  const budgetMap = budgets.reduce((acc, budget) => {
    acc[budget.category] = budget.budgetAmount;
    return acc;
  }, {} as { [key: string]: number });

  const spending = expenses.reduce((acc, expense) => {
    const category = expense.category || "Uncategorized";
    acc[category] = (acc[category] || 0) + expense.amount;
    return acc;
  }, {} as { [key: string]: number });

  const allCategories = new Set([
    ...Object.keys(budgetMap),
    ...Object.keys(spending),
  ]);

  if (allCategories.size === 0) {
    return (
      <Card title={`Budget Overview${periodLabel ? ` - ${periodLabel}` : ""}`}>
        <div
          style={{
            textAlign: "center",
            padding: "40px 20px",
            color: "#6c757d",
          }}
        >
          <div style={{ fontSize: "3em", marginBottom: "15px" }}>🎯</div>
          <h4 style={{ marginBottom: "10px" }}>No budgets or expenses yet</h4>
          <p style={{ margin: 0, fontSize: "0.9em" }}>
            Set some budgets and add expenses to see your progress
          </p>
        </div>
      </Card>
    );
  }

  const totalBudget = Object.values(budgetMap).reduce(
    (sum, amount) => sum + amount,
    0
  );
  const totalSpent = Object.values(spending).reduce(
    (sum, amount) => sum + amount,
    0
  );
  const totalRemaining = totalBudget - totalSpent;

  return (
    <Card title={`Budget vs. Actual Spending${periodLabel ? ` - ${periodLabel}` : ""}`}>
      <div className="budget-comparison">
        <div className="summary">
          <div className="total-budget">
            <div className="label">Total Budget</div>
            <div className="value">${totalBudget.toFixed(2)}</div>
          </div>
          <div className="total-spent">
            <div className="label">Total Spent</div>
            <div className="value">${totalSpent.toFixed(2)}</div>
          </div>
          <div className="remaining">
            <div className="label">Remaining</div>
            <div
              className={`value ${
                totalRemaining >= 0 ? "positive" : "negative"
              }`}
            >
              ${totalRemaining.toFixed(2)}
            </div>
          </div>
        </div>

        <h4 style={{ marginBottom: "15px" }}>Category Breakdown</h4>
        <ul className="category-breakdown">
          {Array.from(allCategories)
            .sort()
            .map((category) => {
              const budgetAmount = budgetMap[category] || 0;
              const spentAmount = spending[category] || 0;
              const remaining = budgetAmount - spentAmount;
              const percentage =
                budgetAmount > 0 ? (spentAmount / budgetAmount) * 100 : 0;

              let statusColor = "#28a745";
              if (percentage > 90) statusColor = "#ffc107";
              if (percentage > 100) statusColor = "#dc3545";

              return (
                <li key={category} className="category-item">
                  <div className="header">
                    <div>
                      <div className="name">{category}</div>
                      <div className="details">
                        ${spentAmount.toFixed(2)} of ${budgetAmount.toFixed(2)}
                        {budgetAmount > 0 && (
                          <span style={{ marginLeft: "10px" }}>
                            ({percentage.toFixed(1)}%)
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="status">
                      {budgetAmount > 0 ? (
                        <strong
                          className="amount"
                          style={{ color: statusColor }}
                        >
                          {remaining >= 0
                            ? `$${remaining.toFixed(2)} Left`
                            : `-$${Math.abs(remaining).toFixed(2)} Over`}
                        </strong>
                      ) : (
                        <span className="no-budget">No Budget Set</span>
                      )}
                    </div>
                  </div>

                  {budgetAmount > 0 && (
                    <div className="progress-bar">
                      <div
                        className="progress"
                        style={{
                          width: `${Math.min(percentage, 100)}%`,
                          backgroundColor: statusColor,
                        }}
                      ></div>
                    </div>
                  )}
                </li>
              );
            })}
        </ul>
      </div>
    </Card>
  );
}

export default BudgetComparison;