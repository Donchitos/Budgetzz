import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, BarChart2, CircleDollarSign, Receipt, Repeat, Target } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const MobileNavigation: React.FC = () => {
  const { user } = useAuth();
  const profilePic = user?.photoURL || "https://via.placeholder.com/40";

  return (
    <nav className="navigation mobile" aria-label="Main navigation">
      <NavLink to="/dashboard"><Home /></NavLink>
      <NavLink to="/reports"><BarChart2 /></NavLink>
      <NavLink to="/budgets"><CircleDollarSign /></NavLink>
      <NavLink to="/transactions"><Receipt /></NavLink>
      <NavLink to="/recurring"><Repeat /></NavLink>
      <NavLink to="/goals"><Target /></NavLink>
      <NavLink to="/settings">
        <img src={profilePic} alt="User Profile" className="profile-pic" />
      </NavLink>
    </nav>
  );
};

export default MobileNavigation;