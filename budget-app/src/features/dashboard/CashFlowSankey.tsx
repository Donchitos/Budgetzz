import React from 'react';
import { useTransactions } from '../../hooks/useTransactions';
import Card from '../../components/Card';
import { Sankey, Tooltip, ResponsiveContainer } from 'recharts';

const CashFlowSankey: React.FC = () => {
  const { income, expenses } = useTransactions(new Date());

  const totalIncome = income
    .filter((t) => typeof t.amount === 'number' && isFinite(t.amount))
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalExpenses = expenses
    .filter((t) => typeof t.amount === 'number' && isFinite(t.amount))
    .reduce((acc, curr) => acc + curr.amount, 0);

  const nodes = [
    { name: 'Income' },
    { name: 'Balance' },
    { name: 'Expenses' },
  ];

  const links = [
    { source: 0, target: 1, value: totalIncome },
    { source: 1, target: 2, value: totalExpenses },
  ].filter((link) => link.value > 0);

  const data = { nodes, links };

  if (links.length === 0) {
    return (
      <Card>
        <h2>Cash Flow</h2>
        <div
          style={{
            width: '100%',
            height: 300,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <p>No cash flow data for this period.</p>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <h2>Cash Flow</h2>
      <ResponsiveContainer width="100%" height={300}>
        <Sankey
                  data={data}
                  linkCurvature={0.5}
                  nodePadding={50}
                  nodeWidth={10}
                  nameKey="name"
                >
          <Tooltip />
        </Sankey>
      </ResponsiveContainer>
    </Card>
  );
};

export default CashFlowSankey;