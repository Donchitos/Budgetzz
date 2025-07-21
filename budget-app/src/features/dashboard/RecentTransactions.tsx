import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { useTransactions } from '../../hooks/useTransactions';
import './RecentTransactions.css';
import type { Transaction } from '../../types';
import { Timestamp } from 'firebase/firestore';

const RecentTransactions: React.FC = () => {
  const { income, expenses, loading } = useTransactions(new Date());

  const transactions = [...income, ...expenses]
    .sort((a, b) => {
      const dateA = a.createdAt instanceof Timestamp ? a.createdAt.toDate() : a.createdAt;
      const dateB = b.createdAt instanceof Timestamp ? b.createdAt.toDate() : b.createdAt;
      return (dateB?.getTime() || 0) - (dateA?.getTime() || 0);
    });

  const formatDate = (date: any) => {
    if (!date) return '';
    const d = date.toDate ? date.toDate() : new Date(date);
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(d);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="recent-transactions-card">
      <div className="recent-transactions-header">
        <h3 className="recent-transactions-title">Recent Transactions</h3>
      </div>
      <div>
        {transactions.slice(0, 5).map((transaction: Transaction) => (
          <div key={transaction.id} className="transaction-item">
            <div className={`transaction-icon-container ${transaction.type}`}>
              {transaction.type === 'income' ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
            </div>
            <div className="transaction-details">
              <div className="transaction-description">{transaction.description}</div>
              <div className="transaction-category">{transaction.category}</div>
            </div>
            <div>
              <div className={`transaction-amount ${transaction.type}`}>
                {transaction.type === 'income' ? '+' : '-'}${Math.abs(transaction.amount).toFixed(2)}
              </div>
              <div className="transaction-date">{formatDate(transaction.createdAt)}</div>
            </div>
          </div>
        ))}
      </div>
      <button className="view-all-button">
        View All Transactions
      </button>
    </div>
  );
};

export default RecentTransactions;