import React, { useState } from 'react';
import { signOut } from "firebase/auth";
import { auth } from "../../services/firebase";
import ExpenseTracker from "../../features/transactions/ExpenseTracker";
import IncomeTracker from "../../features/transactions/IncomeTracker";
import ExpenseChart from "../../features/transactions/ExpenseChart";
import BudgetManager from "../../features/budget/BudgetManager";
import BudgetComparison from "../../features/budget/BudgetComparison";
import RecurringTransactionManager from "../../features/recurring/RecurringTransactionManager";
import DueTransactionsReview from "../../features/recurring/DueTransactionsReview";
import UpcomingTransactions from "../../features/recurring/UpcomingTransactions";
import GoalsManager from '../goals/GoalsManager';
import GoalsSummaryWidget from '../goals/GoalsSummaryWidget';
import SmartGoalSuggestions from '../goals/SmartGoalSuggestions';
import ReportsPage from '../reports/ReportsPage';
import FinancialInsights from './FinancialInsights';
import PeriodSelector from "../../components/PeriodSelector";
import Button from "../../components/Button";
import { getCurrentMonth } from "../../utils/dateUtils";
import { useData } from "../../hooks/useData";
import "./Dashboard.css";

type TabType = 'overview' | 'recurring' | 'budgets' | 'transactions' | 'goals' | 'reports';

function Dashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState<Date>(getCurrentMonth());
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  
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
  if (error) {
    console.error("Error loading data:", error);
    return <p>Error loading data: {error.message}. Check the console for more details.</p>;
  }

  const TabButton = ({ tab, label, children }: { tab: TabType; label: string; children: React.ReactNode }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`tab-button ${activeTab === tab ? 'active' : ''}`}
    >
      {children}
      {label}
    </button>
  );

  return (
    <div className="dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <h1>Welcome, {auth.currentUser?.email}</h1>
        <div className="balance">
          <h2 className={balance >= 0 ? "positive" : "negative"}>
            Balance: ${balance.toFixed(2)}
          </h2>
          <Button onClick={handleLogout}>Logout</Button>
        </div>
      </div>

      {/* Due Transactions Alert - Always visible */}
      <DueTransactionsReview />

      {/* Period Selector */}
      <PeriodSelector
        selectedDate={selectedPeriod}
        onDateChange={setSelectedPeriod}
      />

      {/* Monthly Summary */}
      <div className="monthly-summary">
        <div className="summary-card income">
          <h3>Income</h3>
          <p>${totalIncome.toFixed(2)}</p>
        </div>
        <div className="summary-card expenses">
          <h3>Expenses</h3>
          <p>${totalExpenses.toFixed(2)}</p>
        </div>
        <div className="summary-card net">
          <h3 className={balance >= 0 ? "positive" : "negative"}>Net</h3>
          <p className={balance >= 0 ? "positive" : "negative"}>${balance.toFixed(2)}</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <TabButton tab="overview" label="Overview">📊</TabButton>
        <TabButton tab="recurring" label="Recurring">🔄</TabButton>
        <TabButton tab="goals" label="Goals">🏆</TabButton>
        <TabButton tab="budgets" label="Budgets">🎯</TabButton>
        <TabButton tab="transactions" label="Transactions">💰</TabButton>
        <TabButton tab="reports" label="Reports">📈</TabButton>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'overview' && (
          <div className="dashboard-grid">
            <FinancialInsights
              budgets={budgets}
              expenses={expenses}
              totalIncome={totalIncome}
            />
            <ExpenseChart expenses={expenses} />
            <UpcomingTransactions daysAhead={14} />
            <GoalsSummaryWidget />
            <SmartGoalSuggestions />
            <BudgetComparison
              budgets={budgets}
              expenses={expenses}
            />
            <div className="quick-actions-card">
              <h3>Quick Actions</h3>
              <div className="button-group">
                <Button onClick={() => setActiveTab('recurring')}>
                  🔄 Manage Recurring
                </Button>
                <Button onClick={() => setActiveTab('budgets')}>
                  🎯 Set Budgets
                </Button>
                <Button onClick={() => setActiveTab('transactions')}>
                  💰 Add Transactions
                </Button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'recurring' && (
          <div>
            <RecurringTransactionManager />
            <div style={{ marginTop: '30px' }}>
              <UpcomingTransactions daysAhead={30} />
            </div>
          </div>
        )}

        {activeTab === 'goals' && <GoalsManager />}

        {activeTab === 'budgets' && (
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
        )}

        {activeTab === 'transactions' && (
          <div className="dashboard-grid">
            <IncomeTracker income={income} />
            <ExpenseTracker expenses={expenses} />
          </div>
        )}

        {activeTab === 'reports' && <ReportsPage />}
      </div>

      {/* Help Section */}
      <div className="help-section">
        <h4>💡 Pro Tips for Better Budgeting</h4>
        <ul>
          <li><strong>Set up recurring transactions</strong> for your regular income and expenses to reduce manual entry</li>
          <li><strong>Review due transactions daily</strong> to stay on top of your finances</li>
          <li><strong>Set monthly budgets</strong> for each category to track your spending goals</li>
          <li><strong>Use the period selector</strong> to compare your spending across different months</li>
          <li><strong>Check the upcoming transactions</strong> to plan for future expenses</li>
        </ul>
      </div>
    </div>
  );
}

export default Dashboard;