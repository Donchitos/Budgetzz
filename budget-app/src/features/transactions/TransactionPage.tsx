import React, { useState } from 'react';
import IncomeTracker from './IncomeTracker';
import ExpenseTracker from './ExpenseTracker';
import PeriodSelector from '../../components/PeriodSelector';
import { useData } from '../../hooks/useData';
import { getCurrentMonth } from '../../utils/dateUtils';
import Skeleton from '../../components/Skeleton';
import './TransactionPage.css';

const TransactionPage: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<Date>(getCurrentMonth());
  const { income, expenses, loading, error } = useData(selectedPeriod);

  if (loading) {
    return (
      <div className="transaction-page">
        <header className="page-header">
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-9 w-40" />
        </header>
        <div className="trackers-container">
          <div className="w-1/2">
            <Skeleton className="h-64" />
          </div>
          <div className="w-1/2">
            <Skeleton className="h-64" />
          </div>
        </div>
      </div>
    );
  }

  if (error) return <p>Error loading transactions: {error.message}</p>;

  return (
    <div className="transaction-page">
      <header className="page-header">
        <h1>All Transactions</h1>
        <PeriodSelector
          selectedDate={selectedPeriod}
          onDateChange={setSelectedPeriod}
        />
      </header>
      <div className="trackers-container">
        <IncomeTracker income={income} />
        <ExpenseTracker expenses={expenses} />
      </div>
    </div>
  );
};

export default TransactionPage;