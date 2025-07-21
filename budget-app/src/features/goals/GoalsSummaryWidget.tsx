import React from 'react';
import useFirestoreCollection from '../../hooks/useFirestoreCollection';
import type { FinancialGoal } from '../../types/goals';
import Card from '../../components/Card';
import Skeleton from '../../components/Skeleton';
import ProgressBar from '../gamification/ProgressBar';
import './GoalsSummaryWidget.css';

const GoalsSummaryWidget: React.FC = () => {
  const { snapshot, loading, error } = useFirestoreCollection('financial-goals');

  if (loading) {
    return (
      <Card title="Goals Progress">
        <div className="goals-summary-widget">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      </Card>
    );
  }

  if (error) {
    return <p>Error loading goals: {error.message}</p>;
  }

  const goals: FinancialGoal[] = snapshot ? snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  } as FinancialGoal)) : [];

  return (
    <Card title="Goals Progress">
      <div className="goals-summary-widget">
        {goals.length > 0 ? (
          goals.slice(0, 3).map((goal) => {
            const percentage = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
            return (
              <div key={goal.id} className="goal-item">
                <div className="goal-title">{goal.title}</div>
                <div className="goal-progress">
                  <ProgressBar value={goal.currentAmount} max={goal.targetAmount} />
                  <span className="progress-text">{Math.round(percentage)}%</span>
                </div>
                <div className="goal-amount">
                  ${goal.currentAmount.toLocaleString()} / ${goal.targetAmount.toLocaleString()}
                </div>
              </div>
            );
          })
        ) : (
          <p>No goals yet. Create one in the Goals tab!</p>
        )}
      </div>
    </Card>
  );
};

export default GoalsSummaryWidget;