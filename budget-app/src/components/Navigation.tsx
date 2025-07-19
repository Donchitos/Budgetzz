import React from 'react';
import { NavLink } from 'react-router-dom';
import NotificationBell from '../features/alerts/NotificationBell';
import './Navigation.css';

const Navigation: React.FC = () => {
  return (
    <nav className="navigation" aria-label="Main navigation">
      <div className="nav-logo">
        <NavLink to="/dashboard">BudgetApp</NavLink>
      </div>
      <div className="nav-links">
        <NavLink to="/dashboard" end>Dashboard</NavLink>
        <NavLink to="/transactions">Transactions</NavLink>
        <NavLink to="/budgets">Budgets</NavLink>
        <NavLink to="/goals">Goals</NavLink>
        <NavLink to="/reports">Reports</NavLink>
        <NavLink to="/alerts">Alerts</NavLink>
      </div>
      <div className="nav-user">
        <NotificationBell />
        {/* User profile icon/menu can be added here */}
      </div>
    </nav>
  );
};

export default Navigation;