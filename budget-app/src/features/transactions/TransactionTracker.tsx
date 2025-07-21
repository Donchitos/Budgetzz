import React, { useState } from 'react';
import TransactionForm from './TransactionForm';
import Card from '../../components/Card';
import type { Transaction } from '../../types';
import TransactionList from '../../components/TransactionList';
import { useTransactions } from '../../hooks/useTransactions';
import './TransactionTracker.css';

interface TransactionTrackerProps {
  transactions: Transaction[];
  transactionType: 'income' | 'expenses';
  title: string;
}

function TransactionTracker({
  transactions,
  transactionType,
  title,
}: TransactionTrackerProps) {
  const { deleteTransaction } = useTransactions(new Date());
  const [showForm, setShowForm] = useState(false);

  const total = transactions.reduce((sum, item) => sum + item.amount, 0);

  const handleDeleteTransaction = async (id: string) => {
    if (
      window.confirm(
        `Are you sure you want to delete this ${transactionType.toLowerCase()}?`
      )
    ) {
      try {
        await deleteTransaction(transactionType, id);
      } catch (err) {
        console.error(`Error deleting ${transactionType}: `, err);
        alert(`Error deleting ${transactionType}. Please try again.`);
      }
    }
  };

  return (
    <Card title={title}>
      <div className="tracker-header">
        <button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : `Add ${transactionType === 'income' ? 'Income' : 'Expense'}`}
        </button>
      </div>
      {showForm && (
        <TransactionForm
          transactionType={transactionType}
          onFormSubmit={() => setShowForm(false)}
        />
      )}
      <hr />
      <div className="tracker-summary">
        <h2 className={transactionType.toLowerCase()}>
          Total {transactionType}: ${total.toFixed(2)}
        </h2>
        <div className="count">
          {transactions.length} transaction
          {transactions.length !== 1 ? 's' : ''}
        </div>
      </div>
      <TransactionList
        transactions={transactions}
        onDelete={handleDeleteTransaction}
        title={`Your ${transactionType}`}
      />
    </Card>
  );
}

export default TransactionTracker;