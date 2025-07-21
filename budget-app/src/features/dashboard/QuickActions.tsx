import React from 'react';
import Card from '../../components/Card';
import Button from '../../components/Button';

const QuickActions: React.FC = () => {
  return (
    <Card title="Quick Actions">
      <div className="quick-actions-buttons">
        <Button onClick={() => {}}>Add Income</Button>
        <Button onClick={() => {}}>Add Expense</Button>
        <Button onClick={() => {}}>Add Transfer</Button>
      </div>
    </Card>
  );
};

export default QuickActions;