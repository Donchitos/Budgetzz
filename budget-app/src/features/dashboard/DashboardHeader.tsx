import React from "react";
import { signOut } from "firebase/auth";
import { auth } from "../../services/firebase";
import Button from "../../components/Button";

const DashboardHeader: React.FC = () => {
  const handleLogout = () => {
    signOut(auth);
  };

  return (
    <header className="dashboard-header">
      <div>
        <h1>Dashboard</h1>
        <p>Welcome back, {auth.currentUser?.email}</p>
      </div>
      <Button onClick={handleLogout} variant="secondary">
        Logout
      </Button>
    </header>
  );
};

export default DashboardHeader;