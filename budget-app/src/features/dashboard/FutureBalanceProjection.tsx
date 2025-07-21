import React, { useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import type { ScriptableLineSegmentContext } from 'chart.js';
import Card from '../../components/Card';
import { useBalanceProjection } from '../../hooks/useBalanceProjection';
import type { RecurringTransaction } from '../../types';

// Balance Thresholds
const SAFE_BALANCE = 1000;
const CAUTION_BALANCE = 250;

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
    },
  };

  return (
    <Card title="Future Balance Projection">
      {loading ? (
        <p>Loading projection...</p>
      ) : (
        <>
          <Line data={data} options={options} />
          {lowestPoint && (
            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
              <strong>Lowest Point:</strong>
              {` ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(lowestPoint.balance)} on ${lowestPoint.date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}`}
            </div>
          )}
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