import React, { useState, useEffect } from 'react';
import type { FinancialGoal } from '../../types/goals';
import Input from '../../components/Input';
import Button from '../../components/Button';
import './GoalForm.css';

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
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>{goal ? 'Edit Goal' : 'Create Goal'}</h2>
        <form onSubmit={handleSubmit} className="goal-form">
          <Input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Goal Name"
            required
          />
          <Input
            type="number"
            value={targetAmount}
            onChange={(e) => setTargetAmount(e.target.value)}
            placeholder="Target Amount"
            required
          />
          <Input
            type="date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
            required
          />
          <div className="form-actions">
            <Button type="submit">{goal ? 'Save Changes' : 'Add Goal'}</Button>
            <Button type="button" onClick={onCancel} variant="secondary">Cancel</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GoalForm;