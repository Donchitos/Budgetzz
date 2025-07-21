import React from 'react';
import './Dashboard.css';
import Navigation from '../../components/Navigation';
import DashboardMainContent from './DashboardMainContent';
import UpcomingBills from './UpcomingBills';
import SpendingTrends from './SpendingTrends';
import CashFlowSankey from './CashFlowSankey';

const Dashboard: React.FC = () => {
  return (
    <div className="dashboard-layout">
      <Navigation />
      <DashboardMainContent />
      <div className="dashboard-widgets">
        <UpcomingBills />
        <SpendingTrends />
        <CashFlowSankey />
      </div>
    </div>
  );
};

export default Dashboard;