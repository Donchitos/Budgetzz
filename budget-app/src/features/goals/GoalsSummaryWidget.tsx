import React from 'react';
import useFirestoreCollection from '../../hooks/useFirestoreCollection';
import type { FinancialGoal } from '../../types/goals';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip } from 'chart.js';
import Card from '../../components/Card';
import Skeleton from '../../components/Skeleton';
import './GoalsSummaryWidget.css';

ChartJS.register(ArcElement, Tooltip);

const GoalProgressChart = ({ goal }: { goal: FinancialGoal }) => {
  const percentage = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
  const data = {
    datasets: [
      {
        data: [goal.currentAmount, Math.max(0, goal.targetAmount - goal.currentAmount)],
        backgroundColor: ['var(--primary-green)', 'var(--neutral-gray-light)'],
        borderWidth: 0,
        circumference: 360,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
      tooltip: { enabled: false },
    },
  };

  return (
    <div className="goal-chart-wrapper">
      <Doughnut data={data} options={options} />
      <div className="goal-chart-center-text">
        {Math.round(percentage)}%
      </div>
    </div>
  );
};

const GoalsSummaryWidget: React.FC = () => {
  const { snapshot, loading, error } = useFirestoreCollection('financial-goals');

  if (loading) {
    return (
      <Card title="Goals Summary">
        <div className="goals-summary-widget">
          <div className="goal-item">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div className="flex-1">
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
          <div className="goal-item">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div className="flex-1">
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        </div>
      </Card>
    );
  }
  if (error) return <p>Error loading goals: {error.message}</p>;

  const goals: FinancialGoal[] = snapshot ? snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  } as FinancialGoal)) : [];

  return (
    <Card title="Goals Summary">
      <div className="goals-summary-widget">
        {goals.length === 0 ? (
          <p className="no-goals-message">No goals yet. Create one in the Goals tab!</p>
        ) : (
          goals.slice(0, 3).map((goal) => (
            <div key={goal.id} className="goal-item">
              <GoalProgressChart goal={goal} />
              <div className="goal-details">
                <div className="goal-title">{goal.title}</div>
                <div className="goal-progress-text">
                  ${goal.currentAmount.toLocaleString()} / ${goal.targetAmount.toLocaleString()}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
};

export default GoalsSummaryWidget;