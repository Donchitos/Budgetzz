import React from 'react';
import Card from '../../components/Card';

const BalanceOverview: React.FC = () => {
  return (
    <Card title="Balance Overview">
      <div>
        <p>Total Balance: $10,000</p>
        {/* Chart will go here */}
      </div>
    </Card>
  );
};

export default BalanceOverview;