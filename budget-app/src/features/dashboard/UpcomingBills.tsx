import React from 'react';
import { useTransactions } from '../../hooks/useTransactions';
import Card from '../../components/Card';
import type { Transaction } from '../../types';

const UpcomingBills: React.FC = () => {
  const { expenses } = useTransactions(new Date());

  const upcomingBills = expenses
    .filter((t: Transaction) => new Date(t.createdAt as Date) > new Date())
    .sort((a: Transaction, b: Transaction) => new Date(a.createdAt as Date).getTime() - new Date(b.createdAt as Date).getTime())
    .slice(0, 5);

  return (
    <Card>
      <h2>Upcoming Bills</h2>
      {upcomingBills.length > 0 ? (
        <ul>
          {upcomingBills.map((bill: Transaction) => (
            <li key={bill.id}>
              <span>{bill.description}</span>
              <span>${bill.amount.toFixed(2)}</span>
              <span>{new Date(bill.createdAt as Date).toLocaleDateString()}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p>No upcoming bills.</p>
      )}
    </Card>
  );
};

export default UpcomingBills;