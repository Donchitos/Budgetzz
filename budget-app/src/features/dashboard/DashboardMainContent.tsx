import React from 'react';
import DashboardHeader from './DashboardHeader';
import DashboardColumns from './DashboardColumns';
import { useDashboardData } from './useDashboardData';

const DashboardMainContent: React.FC = () => {
  const { balance, allRecurring, loading } = useDashboardData();

  return (
    <div className="main-content">
      <DashboardHeader userName="User" />
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