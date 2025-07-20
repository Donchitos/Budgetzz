import React, { useState } from 'react';
import FinancialInsights from './FinancialInsights';
import GoalsSummaryWidget from '../goals/GoalsSummaryWidget';
import TransactionList from '../../components/TransactionList';
import { getCurrentMonth } from "../../utils/dateUtils";
import { useTransactions } from "../../hooks/useTransactions";
import type { Transaction } from '../../types';
import Skeleton from '../../components/Skeleton';
import DashboardHeader from './DashboardHeader';
import BalanceOverview from './BalanceOverview';
import QuickActions from './QuickActions';
import "./Dashboard.css";

function Dashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState<Date>(getCurrentMonth());
  
  const {
    income,
    expenses,
    totalIncome,
    totalExpenses,
    loading,
    error,
    deleteTransaction,
  } = useTransactions(selectedPeriod);

  const balance = totalIncome - totalExpenses;

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
      <DashboardHeader />
      <BalanceOverview
        balance={balance}
        totalIncome={totalIncome}
        totalExpenses={totalExpenses}
      />
      <div className="dashboard-main-content">
        <div className="dashboard-left-column">
          <TransactionList
            title="Recent Transactions"
            transactions={recentTransactions}
            onDelete={(id: string) => deleteTransaction(id)}
          />
        </div>
        <div className="dashboard-right-column">
          <QuickActions />
          <FinancialInsights
            budgets={[]}
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