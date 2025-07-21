import React from 'react';
import { NavLink } from 'react-router-dom';
import NotificationBell from '../features/alerts/NotificationBell';
import './Navigation.css';

const Navigation: React.FC = () => {
  return (
    <nav className="navigation" aria-label="Main navigation">
      <div className="nav-logo">
        <NavLink to="/transactions">BudgetApp</NavLink>
      </div>
      <div className="nav-links">
        <NavLink to="/recurring">Recurring</NavLink>
        <NavLink to="/goals">Goals</NavLink>
        <NavLink to="/budgets">Budgets</NavLink>
        <NavLink to="/transactions">Transactions</NavLink>
        <NavLink to="/reports">Reports</NavLink>
      </div>
      <div className="nav-user">
        <NotificationBell />
        <NavLink to="/settings">Settings</NavLink>
      </div>
    </nav>
  );
};

export default Navigation;