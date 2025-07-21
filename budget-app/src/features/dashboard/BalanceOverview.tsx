import React from 'react';
import { TrendingUp, TrendingDown, PiggyBank, Landmark } from 'lucide-react';
import FutureBalanceProjection from './FutureBalanceProjection';
import { useDashboardData } from './useDashboardData';
import './BalanceOverview.css';

const BalanceOverview: React.FC = () => {
  const {
    balance,
    monthlyIncome,
    monthlyExpenses,
    emergencyFundCoverage,
    allRecurring,
    loading,
  } = useDashboardData();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (balance === null) {
    return <div>No balance data available.</div>;
  }

  return (
    <div className="balance-overview-card">
      <div className="balance-header">
        <div>
          <p className="balance-label">Current Balance</p>
          <h2 className="balance-amount">${balance.toLocaleString()}</h2>
        </div>
      </div>

      <div className="quick-stats">
        <div className="stat-item">
          <div className="stat-icon income">
            <TrendingUp size={20} />
          </div>
          <div className="stat-info">
            <h4>${monthlyIncome.toLocaleString()}</h4>
            <p>Monthly Income</p>
          </div>
        </div>
        <div className="stat-item">
          <div className="stat-icon expenses">
            <TrendingDown size={20} />
          </div>
          <div className="stat-info">
            <h4>${monthlyExpenses.toLocaleString()}</h4>
            <p>Monthly Expenses</p>
          </div>
        </div>
        <div className="stat-item">
          <div className="stat-icon months">
            <PiggyBank size={20} />
          </div>
          <div className="stat-info">
            <h4>{emergencyFundCoverage.toFixed(1)} Months</h4>
            <p>Covered</p>
          </div>
        </div>
      </div>

      <FutureBalanceProjection
        currentBalance={balance}
        recurringTransactions={allRecurring}
      />
    </div>
  );
};

export default BalanceOverview;