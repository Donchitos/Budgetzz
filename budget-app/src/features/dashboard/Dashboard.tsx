import React from 'react';
import './Dashboard.css';
import BalanceOverview from './BalanceOverview';
import QuickActions from './QuickActions';
import FinancialInsights from './FinancialInsights';
import GoalsSummaryWidget from '../goals/GoalsSummaryWidget';
import UpcomingTransactions from '../recurring/UpcomingTransactions';
import TransactionTracker from '../transactions/TransactionTracker';
import DashboardHeader from './DashboardHeader';
import GamificationSummary from '../gamification/GamificationSummary';
import Navigation from '../../components/Navigation';

const Dashboard: React.FC = () => {
  return (
    <div className="dashboard-layout">
      <Navigation />
      <div className="main-content">
        <DashboardHeader userName="User" />
        <div className="dashboard-container">
          <div className="dashboard-grid">
            <div className="grid-item-large">
              <BalanceOverview />
            </div>
            <div className="grid-item-medium">
              <QuickActions />
            </div>
            <div className="grid-item-medium">
              <FinancialInsights />
            </div>
            <div className="grid-item-wide">
              <TransactionTracker
                transactions={[]}
                transactionType="Expense"
                title="Recent Transactions"
              />
            </div>
            <div className="grid-item-standard">
              <UpcomingTransactions />
            </div>
            <div className="grid-item-standard">
              <GoalsSummaryWidget />
            </div>
            <div className="grid-item-standard">
              <GamificationSummary />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;