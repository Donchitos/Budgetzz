import React from 'react';
import { useTransactions } from '../../hooks/useTransactions';
import Card from '../../components/Card';
import { Sankey, Tooltip, ResponsiveContainer } from 'recharts';

const CashFlowSankey: React.FC = () => {
  const { income, expenses } = useTransactions(new Date());

  const nodes = [
    { name: 'Income' },
    { name: 'Balance' },
    { name: 'Expenses' },
  ];

  const links = [
    { source: 0, target: 1, value: income.reduce((acc, curr) => acc + curr.amount, 0) },
    { source: 1, target: 2, value: expenses.reduce((acc, curr) => acc + curr.amount, 0) },
  ];

  const data = { nodes, links };

  return (
    <Card>
      <h2>Cash Flow</h2>
      <ResponsiveContainer width="100%" height={300}>
        <Sankey
          data={data}
          nodeWidth={10}
          linkCurvature={0.5}
        >
          <Tooltip />
        </Sankey>
      </ResponsiveContainer>
    </Card>
  );
};

export default CashFlowSankey;