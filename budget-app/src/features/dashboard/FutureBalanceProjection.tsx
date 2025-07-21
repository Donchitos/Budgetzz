import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import Card from '../../components/Card';
import { useBalanceProjection } from '../../hooks/useBalanceProjection';
import type { RecurringTransaction } from '../../types';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface FutureBalanceProjectionProps {
  currentBalance: number;
  recurringTransactions: RecurringTransaction[];
  daysToProject?: number;
}

const FutureBalanceProjection: React.FC<FutureBalanceProjectionProps> = ({
  currentBalance,
  recurringTransactions,
  daysToProject = 90,
}) => {
  const { projection, loading } = useBalanceProjection(currentBalance, recurringTransactions, daysToProject);

  const data = {
    labels: projection.map(p => p.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
    datasets: [
      {
        label: 'Projected Balance',
        data: projection.map(p => p.balance),
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: `Balance Projection for the Next ${daysToProject} Days`,
      },
    },
  };

  return (
    <Card title="Future Balance Projection">
      {loading ? (
        <p>Loading projection...</p>
      ) : (
        <Line data={data} options={options} />
      )}
    </Card>
  );
};

export default FutureBalanceProjection;