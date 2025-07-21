import React from 'react';
import BalanceOverview from './BalanceOverview';
import FinancialInsights from './FinancialInsights';
import QuickActions from './QuickActions';
import GoalsSummaryWidget from '../goals/GoalsSummaryWidget';
import RecentTransactions from './RecentTransactions';
import CategorySpending from './CategorySpending';
import UpcomingBills from './UpcomingBills';
import { useDashboardData } from './useDashboardData';

const DashboardColumns: React.FC = () => {
  const {
    recentTransactions,
    categorySpending,
    totalBudget,
    totalSpent,
    lastMonthExpenses,
  } = useDashboardData();

  return (
    <div className="dashboard-columns">
      {/* Left Column */}
      <div className="dashboard-column">
        <BalanceOverview />
        <QuickActions />
        <UpcomingBills />
      </div>

      {/* Center Column */}
      <div className="dashboard-column">
        <RecentTransactions />
        <CategorySpending />
      </div>

      {/* Right Column */}
      <div className="dashboard-column">
        <GoalsSummaryWidget />
        <FinancialInsights
          currentExpenses={totalSpent}
          lastMonthExpenses={lastMonthExpenses}
          categorySpending={categorySpending}
          savingsGoalProgress={0} // This should be calculated based on goals
        />
      </div>
    </div>
  );
};

export default DashboardColumns;