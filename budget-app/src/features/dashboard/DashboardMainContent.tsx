import React from 'react';
import DashboardHeader from './DashboardHeader';
import { useAuth } from '../../hooks/useAuth';
import DashboardColumns from './DashboardColumns.tsx';
import { useDashboardData } from './useDashboardData';
import { useNavigate } from 'react-router-dom';

const DashboardMainContent: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="main-content">
      <DashboardHeader userName={user?.displayName || 'User'} />
      <div className="dashboard-container">
        <DashboardColumns />
      </div>
    </div>
  );
};

export default DashboardMainContent;