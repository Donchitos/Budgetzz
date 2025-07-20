import React from "react";
import { signOut } from "firebase/auth";
import { auth } from "../../services/firebase";
import Button from "../../components/Button";
import PeriodSelector from "../../components/PeriodSelector";

interface DashboardHeaderProps {
  selectedPeriod: Date;
  setSelectedPeriod: React.Dispatch<React.SetStateAction<Date>>;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ selectedPeriod, setSelectedPeriod }) => {
  const handleLogout = () => {
    signOut(auth);
  };

  return (
    <header className="dashboard-header">
      <div>
        <h1>Dashboard</h1>
        <p>Welcome back, {auth.currentUser?.email}</p>
      </div>
      <div className="header-actions">
        <PeriodSelector selectedDate={selectedPeriod} onDateChange={setSelectedPeriod} />
        <Button onClick={handleLogout} variant="secondary">
          Logout
        </Button>
      </div>
    </header>
  );
};

export default DashboardHeader;