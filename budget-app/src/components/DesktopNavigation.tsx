import React from 'react';
import { NavLink } from 'react-router-dom';
import NotificationBell from '../features/alerts/NotificationBell';
import { useAuth } from '../hooks/useAuth';

const DesktopNavigation: React.FC = () => {
  const { user } = useAuth();
  const profilePic = user?.photoURL || "https://via.placeholder.com/40";

  return (
    <nav className="navigation desktop" aria-label="Main navigation">
      <div className="nav-logo">
        <NavLink to="/dashboard">BudgetApp</NavLink>
      </div>
      <div className="nav-links">
        <NavLink to="/dashboard">Dashboard</NavLink>
        <NavLink to="/recurring">Recurring</NavLink>
        <NavLink to="/goals">Goals</NavLink>
        <NavLink to="/budgets">Budgets</NavLink>
        <NavLink to="/transactions">Transactions</NavLink>
        <NavLink to="/reports">Reports</NavLink>
      </div>
      <div className="nav-user">
        <NotificationBell />
        <NavLink to="/settings" className="profile-link">
          <img src={profilePic} alt="User Profile" className="profile-pic" />
        </NavLink>
      </div>
    </nav>
  );
};

export default DesktopNavigation;