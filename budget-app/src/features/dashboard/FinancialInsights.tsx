import React from 'react';
import Card from '../../components/Card';

const FinancialInsights: React.FC = () => {
  return (
    <Card title="Your Financial Wellness">
      <div>
        <p>You've spent 5% more this month. Let's see where we can improve!</p>
        {/* More insights will go here */}
      </div>
    </Card>
  );
};

export default FinancialInsights;