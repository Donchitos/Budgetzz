import React, { useState } from 'react';
import Input from '../../components/Input';
import Button from '../../components/Button';

interface AddFundsFormProps {
  onSubmit: (amount: number) => void;
  onCancel: () => void;
}

const AddFundsForm: React.FC<AddFundsFormProps> = ({ onSubmit, onCancel }) => {
  const [amount, setAmount] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmount = parseFloat(amount);
    if (numericAmount > 0) {
      onSubmit(numericAmount);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="modal-form">
      <div className="modal-field">
        <Input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount"
          required
          step="0.01"
          min="0.01"
        />
      </div>
      
      <div className="modal-actions">
        <Button type="submit" className="btn-primary">
          ADD FUNDS
        </Button>
        <Button type="button" onClick={onCancel} className="btn-secondary">
          CANCEL
        </Button>
      </div>
    </form>
  );
};

export default AddFundsForm;