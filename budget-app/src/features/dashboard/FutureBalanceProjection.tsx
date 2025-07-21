import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import type { ScriptableLineSegmentContext } from 'chart.js';
import AnnotationPlugin from 'chartjs-plugin-annotation';
import { useBalanceProjection } from '../../hooks/useBalanceProjection';
import type { RecurringTransaction } from '../../types';

// Balance Thresholds
const SAFE_BALANCE = 1000;
const CAUTION_BALANCE = 250;

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, AnnotationPlugin);

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
        tension: 0.1,
        segment: {
          borderColor: (ctx: ScriptableLineSegmentContext) => {
            const y = ctx.p1.parsed.y;
            if (y < CAUTION_BALANCE) {
              return 'rgb(255, 99, 132)'; // Danger
            }
            if (y < SAFE_BALANCE) {
              return 'rgb(255, 205, 86)'; // Caution
            }
            return 'rgb(75, 192, 192)'; // Safe
          },
        },
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: `Next ${daysToProject} Days`,
        align: 'start' as const,
        font: {
          size: 16,
          weight: 'bold',
        },
        padding: {
          bottom: 16,
        }
      },
    },
    scales: {
      y: {
        ticks: {
          callback: function(value: any) {
            return '$' + (value / 1000) + 'k';
          }
        }
      }
    }
  };

  if (loading) {
    return <p>Loading projection...</p>;
  }

  return (
    <div>
      <Line data={data} options={options} />
    </div>
  );
};

export default FutureBalanceProjection;