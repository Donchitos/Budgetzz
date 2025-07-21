import { useState } from 'react';
import { useTransactions } from './useTransactions';

interface UseTransactionFormProps {
  transactionType: 'income' | 'expenses';
  onFormSubmit: () => void;
}

export const useTransactionForm = ({ transactionType, onFormSubmit }: UseTransactionFormProps) => {
  const { addTransaction } = useTransactions(new Date());
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert('Please enter a valid amount greater than 0.');
      return;
    }
    await addTransaction(
      transactionType,
      description,
      parsedAmount,
      transactionType === 'expenses' ? category : undefined
    );
    setDescription('');
    setAmount('');
    onFormSubmit();
  };

  return {
    description,
    setDescription,
    amount,
    setAmount,
    category,
    setCategory,
    handleSubmit,
  };
};