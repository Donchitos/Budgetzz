import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, BarChart2, CircleDollarSign, Repeat, Target, Settings } from 'lucide-react';
import NotificationBell from '../features/alerts/NotificationBell';
import useMediaQuery from '../hooks/useMediaQuery';
import './Navigation.css';

const Navigation: React.FC = () => {
  const isDesktop = useMediaQuery('(min-width: 768px)');

  if (isDesktop) {
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
          <NavLink to="/settings">Settings</NavLink>
        </div>
      </nav>
    );
  }

  return (
    <nav className="navigation mobile" aria-label="Main navigation">
      <NavLink to="/dashboard"><Home /></NavLink>
      <NavLink to="/reports"><BarChart2 /></NavLink>
      <NavLink to="/budgets"><CircleDollarSign /></NavLink>
      <NavLink to="/recurring"><Repeat /></NavLink>
      <NavLink to="/goals"><Target /></NavLink>
      <NavLink to="/settings"><Settings /></NavLink>
    </nav>
  );
};

export default Navigation;