// src/features/dashboard/Dashboard.tsx
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
import ReportsPage from '../reports/ReportsPage'; // Import the new ReportsPage
import PeriodSelector from "../../components/PeriodSelector";
import Button from "../../components/Button";
import { getCurrentMonth } from "../../utils/dateUtils";
import { useData } from "../../hooks/useData";
import "./Dashboard.css";

type TabType = 'overview' | 'recurring' | 'budgets' | 'transactions' | 'goals' | 'reports'; // Add 'reports' tab

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
      style={{
        padding: '12px 20px',
        border: 'none',
        borderRadius: '8px 8px 0 0',
        backgroundColor: activeTab === tab ? '#3498db' : '#f8f9fa',
        color: activeTab === tab ? 'white' : '#495057',
        fontWeight: activeTab === tab ? 'bold' : 'normal',
        cursor: 'pointer',
        transition: 'all 0.2s',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}
    >
      {children}
      {label}
    </button>
  );

  return (
    <div>
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

      {/* Tab Navigation */}
      <div style={{ 
        display: 'flex', 
        gap: '2px', 
        marginBottom: '0',
        borderBottom: '2px solid #3498db'
      }}>
        <TabButton tab="overview" label="Overview">📊</TabButton>
        <TabButton tab="recurring" label="Recurring">🔄</TabButton>
        <TabButton tab="goals" label="Goals">🏆</TabButton>
        <TabButton tab="budgets" label="Budgets">🎯</TabButton>
        <TabButton tab="transactions" label="Transactions">💰</TabButton>
        <TabButton tab="reports" label="Reports">📈</TabButton>
      </div>

      {/* Tab Content */}
      <div style={{ 
        backgroundColor: '#fff',
        borderRadius: '0 8px 8px 8px',
        border: '1px solid #e9ecef',
        borderTop: 'none',
        padding: '20px',
        marginBottom: '20px'
      }}>
        {activeTab === 'overview' && (
          <div>
            <div style={{ marginBottom: '30px' }}>
              <ExpenseChart expenses={expenses} />
            </div>
            
            <div style={{ marginBottom: '30px' }}>
              <UpcomingTransactions daysAhead={14} />
            </div>

            <div style={{ marginBottom: '30px' }}>
              <GoalsSummaryWidget />
            </div>

            <div style={{ marginBottom: '30px' }}>
              <SmartGoalSuggestions />
            </div>
            
            <div className="dashboard-grid">
              <BudgetComparison
                budgets={budgets}
                expenses={expenses}
              />
              <div style={{ 
                padding: '20px',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                border: '1px solid #e9ecef'
              }}>
                <h3 style={{ marginTop: 0 }}>Quick Actions</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <Button 
                    onClick={() => setActiveTab('recurring')}
                    style={{ backgroundColor: '#28a745' }}
                  >
                    🔄 Manage Recurring Transactions
                  </Button>
                  <Button 
                    onClick={() => setActiveTab('budgets')}
                    style={{ backgroundColor: '#17a2b8' }}
                  >
                    🎯 Set Monthly Budgets
                  </Button>
                  <Button 
                    onClick={() => setActiveTab('transactions')}
                    style={{ backgroundColor: '#6f42c1' }}
                  >
                    💰 Add Manual Transactions
                  </Button>
                </div>
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

        {activeTab === 'goals' && (
          <GoalsManager />
        )}

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

        {activeTab === 'reports' && (
          <ReportsPage />
        )}
      </div>

      {/* Help Section */}
      <div style={{ 
        padding: '20px',
        backgroundColor: '#d4edda',
        borderRadius: '8px',
        border: '1px solid #c3e6cb',
        marginTop: '20px'
      }}>
        <h4 style={{ margin: '0 0 10px 0', color: '#155724' }}>💡 Pro Tips for Better Budgeting</h4>
        <ul style={{ margin: 0, paddingLeft: '20px', color: '#155724' }}>
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