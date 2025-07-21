import React from 'react';
import type { FinancialGoal } from '../../types/goals';
import Card from '../../components/Card';
import Button from '../../components/Button';
import ProgressBar from '../gamification/ProgressBar';
import './GoalCard.css';

interface GoalCardProps {
  goal: FinancialGoal;
  onAddFunds: (goalId: string) => void;
  onEdit: (goal: FinancialGoal) => void;
  onDelete: (goalId: string) => void;
}

const GoalCard: React.FC<GoalCardProps> = ({ goal, onAddFunds, onEdit, onDelete }) => {
  const percentage = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;

  return (
    <Card title={goal.title} className="goal-card">
      <div className="goal-progress">
        <ProgressBar value={goal.currentAmount} max={goal.targetAmount} />
        <span className="progress-text">{Math.round(percentage)}%</span>
      </div>
      <div className="goal-amount">
        ${goal.currentAmount.toLocaleString()} / ${goal.targetAmount.toLocaleString()}
      </div>
      <div className="goal-actions">
        <Button onClick={() => onAddFunds(goal.id)} variant="secondary">Add Funds</Button>
        <Button onClick={() => onEdit(goal)}>Edit</Button>
        <Button onClick={() => onDelete(goal.id)} variant="destructive">Delete</Button>
      </div>
    </Card>
  );
};

export default GoalCard;