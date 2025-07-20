import React from "react";
import Button from "../../components/Button";
import Card from "../../components/Card";

const QuickActions: React.FC = () => {
  return (
    <Card title="Quick Actions">
      <div className="quick-actions-grid">
        <Button>Add Income</Button>
        <Button>Add Expense</Button>
        <Button>New Goal</Button>
        <Button>New Budget</Button>
      </div>
    </Card>
  );
};

export default QuickActions;