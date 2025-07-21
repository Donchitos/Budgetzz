import React from 'react';
import './Dashboard.css';
import Navigation from '../../components/Navigation';
import DashboardColumns from './DashboardColumns';
import { useAuth } from '../../hooks/useAuth';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  return (
    <div className="dashboard-layout">
      <Navigation />
      <main className="main-content">
        <DashboardColumns />
      </main>
    </div>
  );
};

export default Dashboard;