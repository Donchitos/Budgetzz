import React from 'react';
import useFirestoreCollection from '../../hooks/useFirestoreCollection';
import type { FinancialGoal } from '../../types/goals';

const GoalsSummaryWidget: React.FC = () => {
  const { snapshot, loading, error } = useFirestoreCollection('financial-goals');

  if (loading) return <p>Loading goals summary...</p>;
  if (error) return <p>Error loading goals: {error.message}</p>;

  const goals: FinancialGoal[] = snapshot ? snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  } as FinancialGoal)) : [];

  // A simple progress bar component
  const ProgressBar = ({ value, max }: { value: number; max: number }) => {
    const percentage = max > 0 ? (value / max) * 100 : 0;
    return (
      <div style={{ width: '100%', backgroundColor: '#e0e0de', borderRadius: '4px' }}>
        <div
          style={{
            width: `${percentage}%`,
            backgroundColor: '#4caf50',
            height: '20px',
            borderRadius: '4px',
            textAlign: 'center',
            color: 'white',
          }}
        >
          {Math.round(percentage)}%
        </div>
      </div>
    );
  };

  return (
    <div className="goals-summary-widget">
      <h4>Goals Summary</h4>
      {goals.length === 0 ? (
        <p>No goals yet. Create one in the Goals tab!</p>
      ) : (
        goals.slice(0, 4).map((goal) => (
          <div key={goal.id} style={{ marginBottom: '1rem' }}>
            <strong>{goal.title}</strong>
            <ProgressBar value={goal.currentAmount} max={goal.targetAmount} />
            <p>${goal.currentAmount.toLocaleString()} / ${goal.targetAmount.toLocaleString()}</p>
          </div>
        ))
      )}
    </div>
  );
};

export default GoalsSummaryWidget;