import React, { Suspense, lazy, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from './services/firebase';
import Skeleton from './components/Skeleton';
import Navigation from './components/Navigation';
import { useBudget } from './features/budget/useBudget';
import './App.css';

const Login = lazy(() => import('./features/auth/Login'));
const Register = lazy(() => import('./features/auth/Register'));
const SettingsPage = lazy(() => import('./features/settings/SettingsPage'));
const AlertsPage = lazy(() => import('./features/alerts/AlertsPage'));
const BudgetManager = lazy(() => import('./features/budget/BudgetManager'));
const GoalsManager = lazy(() => import('./features/goals/GoalsManager'));
const ReportsPage = lazy(() => import('./features/reports/ReportsPage'));
const TransactionPage = lazy(() => import('./features/transactions/TransactionPage'));
const PrivacyPolicy = lazy(() => import('./components/PrivacyPolicy'));
const RecurringTransactionManager = lazy(() => import('./features/recurring/RecurringTransactionManager'));
const Dashboard = lazy(() => import('./features/dashboard/Dashboard'));

function App() {
  const [user, loading] = useAuthState(auth);
  const [selectedPeriod, setSelectedPeriod] = useState(new Date());
  const { budgets } = useBudget(selectedPeriod);

  if (loading) {
    return (
      <div className="app-container">
        <div className="main-content p-8">
          <Skeleton className="h-screen w-full" />
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className={`app-container ${user ? 'authenticated' : ''}`}>
        {user && <Navigation />}
        <main className="main-content">
          <Suspense fallback={<div className="p-8"><Skeleton className="h-screen w-full" /></div>}>
            <Routes>
              <Route path="/" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
              <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/" />} />
              <Route path="/register" element={!user ? <Register /> : <Navigate to="/dashboard" />} />
              <Route path="/settings" element={user ? <SettingsPage /> : <Navigate to="/" />} />
              <Route path="/transactions" element={user ? <TransactionPage selectedPeriod={selectedPeriod} setSelectedPeriod={setSelectedPeriod} /> : <Navigate to="/" />} />
              <Route path="/budgets" element={user ? <BudgetManager budgets={budgets} selectedPeriod={selectedPeriod} /> : <Navigate to="/" />} />
              <Route path="/goals" element={user ? <GoalsManager /> : <Navigate to="/" />} />
              <Route path="/reports" element={user ? <ReportsPage /> : <Navigate to="/" />} />
              <Route path="/alerts" element={user ? <AlertsPage /> : <Navigate to="/" />} />
              <Route path="/recurring" element={user ? <RecurringTransactionManager /> : <Navigate to="/" />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
            </Routes>
          </Suspense>
        </main>
      </div>
    </Router>
  );
}

export default App;