import React from 'react';
import IncomeTracker from './IncomeTracker';
import ExpenseTracker from './ExpenseTracker';
import PeriodSelector from '../../components/PeriodSelector';
import type { Transaction } from '../../types';

interface TransactionPageContentProps {
  selectedPeriod: Date;
  setSelectedPeriod: React.Dispatch<React.SetStateAction<Date>>;
  income: Transaction[];
  expenses: Transaction[];
}

const TransactionPageContent: React.FC<TransactionPageContentProps> = ({
  selectedPeriod,
  setSelectedPeriod,
  income,
  expenses,
}) => {
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

export default TransactionPageContent;