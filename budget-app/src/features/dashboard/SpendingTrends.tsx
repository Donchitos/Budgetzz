import React from 'react';
import { useTransactions } from '../../hooks/useTransactions';
import Card from '../../components/Card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const SpendingTrends: React.FC = () => {
  const { expenses } = useTransactions(new Date());

  const data = expenses.reduce((acc, curr) => {
    const category = curr.category || 'Uncategorized';
    const existing = acc.find(item => item.name === category);
    if (existing) {
      existing.amount += curr.amount;
    } else {
      acc.push({ name: category, amount: curr.amount });
    }
    return acc;
  }, [] as { name: string; amount: number }[]);

  return (
    <Card>
      <h2>Spending Trends</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="amount" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
};

export default SpendingTrends;