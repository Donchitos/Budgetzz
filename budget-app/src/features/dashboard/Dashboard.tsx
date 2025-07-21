import React from 'react';
import './Dashboard.css';
import BalanceOverview from './BalanceOverview';
import QuickActions from './QuickActions';
import FinancialInsights from './FinancialInsights';
import GoalsSummaryWidget from '../goals/GoalsSummaryWidget';
import DashboardHeader from './DashboardHeader';
import Navigation from '../../components/Navigation';

const Dashboard: React.FC = () => {
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