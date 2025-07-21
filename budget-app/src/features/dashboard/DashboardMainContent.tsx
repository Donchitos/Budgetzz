import React from 'react';
import DashboardHeader from './DashboardHeader';
import { useAuth } from '../../hooks/useAuth';
import DashboardColumns from './DashboardColumns.tsx';
import { useDashboardData } from './useDashboardData';

const DashboardMainContent: React.FC = () => {
  const { balance, allRecurring, loading } = useDashboardData();
  const { user } = useAuth();

  return (
    <div className="main-content">
      <DashboardHeader userName={user?.displayName || 'User'} />
      <div className="dashboard-container">
        <DashboardColumns
          balance={balance}
          allRecurring={allRecurring}
          loading={loading}
        />
      </div>
    </div>
  );
};

export default DashboardMainContent;