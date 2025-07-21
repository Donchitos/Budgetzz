import React from 'react';
import BalanceOverview from './BalanceOverview';
import FinancialInsights from './FinancialInsights';
import FutureBalanceProjection from './FutureBalanceProjection';
import QuickActions from './QuickActions';
import GoalsSummaryWidget from '../goals/GoalsSummaryWidget';
import type { RecurringTransaction } from '../../types';

interface DashboardColumnsProps {
  balance: number | null;
  allRecurring: RecurringTransaction[];
  loading: boolean;
}

const DashboardColumns: React.FC<DashboardColumnsProps> = ({
  balance,
  allRecurring,
  loading,
}) => {
  return (
    <div className="dashboard-columns">
      <div className="dashboard-column-left">
        <BalanceOverview />
        <FinancialInsights />
        {!loading && balance !== null && (
          <FutureBalanceProjection
            currentBalance={balance}
            recurringTransactions={allRecurring}
          />
        )}
      </div>
      <div className="dashboard-column-right">
        <QuickActions />
        <GoalsSummaryWidget />
      </div>
    </div>
  );
};

export default DashboardColumns;