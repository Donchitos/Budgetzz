import React from 'react';
import { useTransactions } from '../../hooks/useTransactions';
import './TransactionPage.css';
import TransactionPageSkeleton from './TransactionPageSkeleton';
import TransactionPageContent from './TransactionPageContent';

interface TransactionPageProps {
  selectedPeriod: Date;
  setSelectedPeriod: React.Dispatch<React.SetStateAction<Date>>;
}

const TransactionPage: React.FC<TransactionPageProps> = ({ selectedPeriod, setSelectedPeriod }) => {
  const { income, expenses, loading, error } = useTransactions(selectedPeriod);

  if (loading) {
    return <TransactionPageSkeleton />;
  }

  if (error) return <p>Error loading transactions: {error.message}</p>;

  return (
    <TransactionPageContent
      selectedPeriod={selectedPeriod}
      setSelectedPeriod={setSelectedPeriod}
      income={income}
      expenses={expenses}
    />
  );
};

export default TransactionPage;