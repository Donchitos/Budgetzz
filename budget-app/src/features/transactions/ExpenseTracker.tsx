import React from 'react';
import type { Transaction } from '../../types';
import TransactionTracker from './TransactionTracker';

interface ExpenseTrackerProps {
  expenses: Transaction[];
}

function ExpenseTracker({ expenses }: ExpenseTrackerProps) {
  return (
    <TransactionTracker
      transactions={expenses}
      transactionType="expenses"
      title="Expense Tracker"
    />
  );
}

export default ExpenseTracker;