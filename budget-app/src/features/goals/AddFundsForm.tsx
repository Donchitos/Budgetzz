import React, { useState } from 'react';
import type { FinancialGoal } from '../../types/goals';
import Input from '../../components/Input';
import Button from '../../components/Button';
import './AddFundsForm.css';

interface AddFundsFormProps {
  onSubmit: (amount: number) => void;
  onCancel: () => void;
}

const AddFundsForm: React.FC<AddFundsFormProps> = ({ onSubmit, onCancel }) => {
  const [amount, setAmount] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(parseFloat(amount));
  };

  return (
    <form onSubmit={handleSubmit} className="add-funds-form">
      <Input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Amount"
        required
      />
      <div className="form-actions">
        <Button type="submit">Add Funds</Button>
        <Button type="button" onClick={onCancel} variant="secondary">
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default AddFundsForm;