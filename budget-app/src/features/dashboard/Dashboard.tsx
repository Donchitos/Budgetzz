import React, { useState } from 'react';
import { signOut } from "firebase/auth";
import { auth } from "../../services/firebase";
import FinancialInsights from './FinancialInsights';
import GoalsSummaryWidget from '../goals/GoalsSummaryWidget';
import TransactionList from '../../components/TransactionList';
import Button from "../../components/Button";
import Card from '../../components/Card';
import { getCurrentMonth } from "../../utils/dateUtils";
import { useData } from "../../hooks/useData";
import type { Transaction } from '../../types';
import Skeleton from '../../components/Skeleton';
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
    deleteTransaction,
  } = useData(selectedPeriod);

  const balance = totalIncome - totalExpenses;

  const handleLogout = () => {
    signOut(auth);
  };

  if (loading) {
    return (
      <div className="dashboard">
        <header className="dashboard-header">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-24" />
        </header>
        <Skeleton className="h-32 w-full mb-8" />
        <div className="dashboard-main-content">
          <div className="dashboard-left-column">
            <Skeleton className="h-96 w-full" />
          </div>
          <div className="dashboard-right-column">
            <Skeleton className="h-48 w-full mb-8" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    );
  }
  if (error) {
    console.error("Error loading data:", error);
    return <p>Error loading data: {error.message}. Check the console for more details.</p>;
  }

  const recentTransactions = [...income, ...expenses]
    .sort((a, b) => {
      const dateA = a.createdAt instanceof Date ? a.createdAt : a.createdAt.toDate();
      const dateB = b.createdAt instanceof Date ? b.createdAt : b.createdAt.toDate();
      return dateB.getTime() - dateA.getTime();
    })
    .slice(0, 7);

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div>
          <h1>Dashboard</h1>
          <p>Welcome back, {auth.currentUser?.email}</p>
        </div>
        <Button onClick={handleLogout} variant="secondary">Logout</Button>
      </header>

      <div className="dashboard-overview-card">
        <div className="balance-section">
          <p className="balance-label">Total Balance</p>
          <h2 className={`balance-amount ${balance >= 0 ? "positive" : "negative"}`}>
            ${balance.toFixed(2)}
          </h2>
        </div>
        <div className="summary-section">
          <div className="summary-item">
            <p className="summary-label">Income</p>
            <p className="summary-value income">${totalIncome.toFixed(2)}</p>
          </div>
          <div className="summary-item">
            <p className="summary-label">Expenses</p>
            <p className="summary-value expenses">${totalExpenses.toFixed(2)}</p>
          </div>
        </div>
      </div>

      <div className="dashboard-main-content">
        <div className="dashboard-left-column">
          <TransactionList
            title="Recent Transactions"
            transactions={recentTransactions}
            onDelete={(id: string) => deleteTransaction(id)}
          />
        </div>
        <div className="dashboard-right-column">
          <Card title="Quick Actions">
            <div className="quick-actions-grid">
              <Button>Add Income</Button>
              <Button>Add Expense</Button>
              <Button>New Goal</Button>
              <Button>New Budget</Button>
            </div>
          </Card>
          <FinancialInsights
            budgets={budgets}
            expenses={expenses}
            totalIncome={totalIncome}
          />
          <GoalsSummaryWidget />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;