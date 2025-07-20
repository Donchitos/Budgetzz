import React from "react";

interface BalanceOverviewProps {
  balance: number;
  totalIncome: number;
  totalExpenses: number;
}

const BalanceOverview: React.FC<BalanceOverviewProps> = ({
  balance,
  totalIncome,
  totalExpenses,
}) => {
  return (
    <div className="dashboard-overview-card">
      <div className="balance-section">
        <p className="balance-label">Total Balance</p>
        <h2 className={`balance-amount ${balance >= 0 ? "positive" : "negative"}`}>
          ${balance.toFixed(2)}
        </h2>
      </div>
      <div className="summary-section">
        <div className="summary-item">
          <p className="summary-label">Income</p>
          <p className="summary-value income">${totalIncome.toFixed(2)}</p>
        </div>
        <div className="summary-item">
          <p className="summary-label">Expenses</p>
          <p className="summary-value expenses">${totalExpenses.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
};

export default BalanceOverview;