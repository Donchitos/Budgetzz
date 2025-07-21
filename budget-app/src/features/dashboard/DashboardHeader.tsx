import React from 'react';
import { Settings, Bell } from 'lucide-react';
import './DashboardHeader.css';

interface DashboardHeaderProps {
  userName: string;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ userName }) => {
  return (
    <header className="dashboard-header">
      <div className="user-info">
        <h2>Hello, {userName}!</h2>
        <p>Let's make today a great financial day.</p>
      </div>
      <div className="header-actions">
        <button className="icon-button">
          <Bell />
        </button>
        <button className="icon-button">
          <Settings />
        </button>
      </div>
    </header>
  );
};

export default DashboardHeader;