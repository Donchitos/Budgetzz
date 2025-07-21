import React from 'react';
import CollapsibleMenu from '../../components/CollapsibleMenu';
import Button from '../../components/Button';
import { DollarSign, ShoppingCart, CreditCard } from 'lucide-react';
import './QuickActions.css';

const QuickActions: React.FC = () => {
  return (
    <CollapsibleMenu title="Quick Actions">
      <div className="quick-actions-buttons">
        <Button onClick={() => {}}>
          <DollarSign size={18} />
          <span>Add Income</span>
        </Button>
        <Button onClick={() => {}}>
          <ShoppingCart size={18} />
          <span>Add Expense</span>
        </Button>
        <Button onClick={() => {}}>
          <CreditCard size={18} />
          <span>Add Transfer</span>
        </Button>
      </div>
    </CollapsibleMenu>
  );
};

export default QuickActions;