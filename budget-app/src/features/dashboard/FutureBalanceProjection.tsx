import React, { useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import type { ScriptableLineSegmentContext } from 'chart.js';
import AnnotationPlugin from 'chartjs-plugin-annotation';
import Card from '../../components/Card';
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
  const [excludedTransactionIds, setExcludedTransactionIds] = useState<string[]>([]);

  const handleToggleTransaction = (transactionId: string) => {
    setExcludedTransactionIds(prev =>
      prev.includes(transactionId)
        ? prev.filter(id => id !== transactionId)
        : [...prev, transactionId]
    );
  };

  const filteredTransactions = recurringTransactions.filter(
    t => !excludedTransactionIds.includes(t.id)
  );

  const { projection, loading } = useBalanceProjection(currentBalance, filteredTransactions, daysToProject);

  const lowestPoint = projection.length > 0 ? projection.reduce(
    (min, p) => (p.balance < min.balance ? p : min),
    projection[0]
  ) : null;

  const daysInSafeZone = projection.filter(p => p.balance >= SAFE_BALANCE).length;

  const milestoneAnnotations = projection
    .flatMap(p => p.transactions.map((t: RecurringTransaction) => ({ ...t, date: p.date })))
    .filter(t => t.type === 'income' && /(salary|paycheck)/i.test(t.description))
    .map((transaction, index) => ({
      type: 'line' as const,
      scaleID: 'x',
      value: transaction.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      borderColor: 'rgba(0, 128, 0, 0.5)',
      borderWidth: 2,
      label: {
        content: `💰 ${transaction.description}`,
        enabled: true,
        position: 'end' as const,
        backgroundColor: 'rgba(0, 128, 0, 0.7)',
        font: {
          size: 10,
        },
        yAdjust: -10 * (index % 3), // Stagger labels
      },
    }));

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
        position: 'top' as const,
      },
      title: {
        display: true,
        text: `Balance Projection for the Next ${daysToProject} Days`,
      },
      annotation: {
        annotations: milestoneAnnotations,
      },
    },
  };

  return (
    <Card title="Future Balance Projection">
      {loading ? (
        <p>Loading projection...</p>
      ) : (
        <>
          <Line data={data} options={options} />
          <div style={{ textAlign: 'center', marginTop: '1rem', display: 'flex', justifyContent: 'center', gap: '2rem' }}>
            {lowestPoint && (
              <div>
                <strong>Lowest Point:</strong>
                {` ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(lowestPoint.balance)} on ${lowestPoint.date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}`}
              </div>
            )}
            <div>
              <strong>Days in safe zone:</strong>
              {` ${daysInSafeZone}/${daysToProject}`}
            </div>
          </div>
          <div style={{ marginTop: '1.5rem' }}>
            <h4>"What If" Scenarios</h4>
            <p>Toggle recurring transactions to see their impact on your balance.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {recurringTransactions.map(transaction => (
                <label key={transaction.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="checkbox"
                    checked={!excludedTransactionIds.includes(transaction.id)}
                    onChange={() => handleToggleTransaction(transaction.id)}
                  />
                  <span>{transaction.description} ({new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(transaction.amount)})</span>
                </label>
              ))}
            </div>
          </div>
        </>
      )}
    </Card>
  );
};

export default FutureBalanceProjection;