import React from 'react';
import './Dashboard.css';
import Navigation from '../../components/Navigation';
import BalanceOverview from './BalanceOverview';
import QuickActions from './QuickActions';
import FinancialInsights from './FinancialInsights';
import GoalsSummaryWidget from '../goals/GoalsSummaryWidget';
import DashboardHeader from './DashboardHeader';
import FutureBalanceProjection from './FutureBalanceProjection';
import { useAccountBalance } from '../../hooks/useAccountBalance';
import useFirestoreCollection from '../../hooks/useFirestoreCollection';
import type { RecurringTransaction } from '../../types';

const Dashboard: React.FC = () => {
  const { balance, loading: balanceLoading } = useAccountBalance();
  const { snapshot: recurringSnapshot, loading: recurringLoading } = useFirestoreCollection('recurring-transactions');

  const allRecurring = recurringSnapshot?.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as RecurringTransaction)) || [];

  return (
    <div className="dashboard-layout">
      <Navigation />
      <div className="main-content">
        <DashboardHeader userName="User" />
        <div className="dashboard-container">
          <div className="dashboard-columns">
            <div className="dashboard-column-left">
              <BalanceOverview />
              <FinancialInsights />
              {(!balanceLoading && !recurringLoading) && (
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
        </div>
      </div>
    </div>
  );
};

export default Dashboard;