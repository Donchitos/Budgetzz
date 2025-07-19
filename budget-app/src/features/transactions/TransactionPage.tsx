import React, { useState } from 'react';
import IncomeTracker from './IncomeTracker';
import ExpenseTracker from './ExpenseTracker';
import PeriodSelector from '../../components/PeriodSelector';
import { useData } from '../../hooks/useData';
import { getCurrentMonth } from '../../utils/dateUtils';
import './TransactionPage.css';

const TransactionPage: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<Date>(getCurrentMonth());
  const { income, expenses, loading, error } = useData(selectedPeriod);

  if (loading) return <p>Loading transactions...</p>;
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