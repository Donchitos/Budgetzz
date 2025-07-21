import React from 'react';
import './Dashboard.css';
import Navigation from '../../components/Navigation';
import DashboardMainContent from './DashboardMainContent';

const Dashboard: React.FC = () => {
  return (
    <div className="dashboard-layout">
      <Navigation />
      <DashboardMainContent />
    </div>
  );
};

export default Dashboard;