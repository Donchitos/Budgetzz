// src/features/dashboard/Dashboard.tsx
import React, { useState } from 'react';
import { signOut } from "firebase/auth";
import { auth } from "../../services/firebase";
import ExpenseTracker from "../../features/transactions/ExpenseTracker";
import IncomeTracker from "../../features/transactions/IncomeTracker";
import ExpenseChart from "../../features/transactions/ExpenseChart";
import BudgetManager from "../../features/budget/BudgetManager";
import BudgetComparison from "../../features/budget/BudgetComparison";
import PeriodSelector from "../../components/PeriodSelector";
import Button from "../../components/Button";
import { getCurrentMonth } from "../../utils/dateUtils";
import { useData } from "../../hooks/useData";
import "./Dashboard.css";

function Dashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState<Date>(getCurrentMonth());
  const {
    income,
    expenses,
    budgets,
    totalIncome,
    totalExpenses,
    loading,
    error,
  } = useData(selectedPeriod);

  const balance = totalIncome - totalExpenses;

  const handleLogout = () => {
    signOut(auth);
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error loading data.</p>;

  return (
    <div>
      <div className="dashboard-header">
        <h1>Welcome, {auth.currentUser?.email}</h1>
        <div className="balance">
          <h2 className={balance >= 0 ? "positive" : "negative"}>
            Balance: ${balance.toFixed(2)}
          </h2>
          <Button onClick={handleLogout}>Logout</Button>
        </div>
      </div>

      <PeriodSelector
        selectedDate={selectedPeriod}
        onDateChange={setSelectedPeriod}
      />

      <div className="monthly-summary">
        <div className="income">
          <h3>Income</h3>
          <p>${totalIncome.toFixed(2)}</p>
        </div>
        <div className="expenses">
          <h3>Expenses</h3>
          <p>${totalExpenses.toFixed(2)}</p>
        </div>
        <div className="net">
          <h3 className={balance >= 0 ? "positive" : "negative"}>Net</h3>
          <p>${balance.toFixed(2)}</p>
        </div>
      </div>

      <hr />

      <ExpenseChart expenses={expenses} />

      <hr />

      <div className="dashboard-grid">
        <BudgetManager
          budgets={budgets}
          selectedPeriod={selectedPeriod}
        />
        <BudgetComparison
          budgets={budgets}
          expenses={expenses}
        />
      </div>

      <hr />

      <div className="dashboard-grid">
        <IncomeTracker income={income} />
        <ExpenseTracker expenses={expenses} />
      </div>
    </div>
  );
}

export default Dashboard;