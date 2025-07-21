import React from 'react';
import './Dashboard.css';
import Navigation from '../../components/Navigation';
import DashboardHeader from './DashboardHeader';
import DashboardColumns from './DashboardColumns';
import { useAuth } from '../../hooks/useAuth';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  return (
    <div className="dashboard-layout">
      <Navigation />
      <main className="main-content">
        <DashboardHeader userName={user?.displayName || 'User'} />
        <DashboardColumns />
      </main>
    </div>
  );
};

export default Dashboard;