import React from 'react';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { useTransactionForm } from '../../hooks/useTransactionForm';
import './Transaction.css';

interface TransactionFormProps {
  transactionType: 'income' | 'expenses';
  onFormSubmit: () => void;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ transactionType, onFormSubmit }) => {
  const {
    description,
    setDescription,
    amount,
    setAmount,
    category,
    setCategory,
    handleSubmit,
  } = useTransactionForm({ transactionType, onFormSubmit });

  return (
    <form onSubmit={handleSubmit} className="transaction-form">
      <Input
        type="text"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder={`${transactionType === 'income' ? 'Income' : 'Expense'} description`}
        required
      />
      <Input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Amount"
        required
      />
      {transactionType === 'expenses' && (
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="Food">Food</option>
          <option value="Transport">Transport</option>
          <option value="Housing">Housing</option>
          <option value="Utilities">Utilities</option>
          <option value="Entertainment">Entertainment</option>
          <option value="Other">Other</option>
        </select>
      )}
      <Button type="submit">Add {transactionType === 'income' ? 'Income' : 'Expense'}</Button>
    </form>
  );
};

export default TransactionForm;