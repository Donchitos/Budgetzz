import React, { useState, useEffect } from 'react';
import type { FinancialGoal } from '../../types/goals';
import Input from '../../components/Input';
import Button from '../../components/Button';

interface GoalFormProps {
  goal?: FinancialGoal;
  onSubmit: (goal: Partial<FinancialGoal>) => void;
  onCancel: () => void;
}

const GoalForm: React.FC<GoalFormProps> = ({ goal, onSubmit, onCancel }) => {
  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [targetDate, setTargetDate] = useState('');

  useEffect(() => {
    if (goal) {
      setTitle(goal.title);
      setTargetAmount(goal.targetAmount.toString());
      setTargetDate(goal.targetDate);
    }
  }, [goal]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      title,
      targetAmount: parseFloat(targetAmount),
      targetDate,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="modal-form">
      <div className="modal-field">
        <Input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Goal Name"
          required
        />
      </div>
      
      <div className="modal-field">
        <Input
          type="number"
          value={targetAmount}
          onChange={(e) => setTargetAmount(e.target.value)}
          placeholder="Target Amount"
          required
          step="0.01"
          min="0"
        />
      </div>
      
      <div className="modal-field">
        <Input
          type="date"
          value={targetDate}
          onChange={(e) => setTargetDate(e.target.value)}
          required
        />
      </div>
      
      <div className="modal-actions">
        <Button type="submit" className="btn-primary">
          {goal ? 'SAVE CHANGES' : 'ADD GOAL'}
        </Button>
        <Button type="button" onClick={onCancel} className="btn-secondary">
          CANCEL
        </Button>
      </div>
    </form>
  );
};

export default GoalForm;