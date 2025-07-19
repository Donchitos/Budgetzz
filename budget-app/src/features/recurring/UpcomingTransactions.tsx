// src/features/recurring/UpcomingTransactions.tsx
import React from 'react';
import useFirestoreCollection from '../../hooks/useFirestoreCollection';
import Card from '../../components/Card';
import { getUpcomingRecurringTransactions, formatFrequency } from '../../types/recurringUtils';
import type { RecurringTransaction } from '../../types';

interface UpcomingTransactionsProps {
  daysAhead?: number;
}

function UpcomingTransactions({ daysAhead = 14 }: UpcomingTransactionsProps) {
  const { snapshot: recurringSnapshot, loading, error } = useFirestoreCollection('recurring-transactions');

  if (loading) return null; // Don't show loading for this preview component
  if (error) return null;

  const allRecurring = recurringSnapshot?.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as RecurringTransaction)) || [];

  const upcomingTransactions = getUpcomingRecurringTransactions(allRecurring, daysAhead);

  if (upcomingTransactions.length === 0) {
    return (
      <Card title={`Next ${daysAhead} Days Preview`}>
        <div style={{ 
          textAlign: 'center',
          padding: '20px',
          color: '#666'
        }}>
          <div style={{ fontSize: '2em', marginBottom: '8px' }}>📅</div>
          <p style={{ margin: 0, fontSize: '0.9em' }}>
            No recurring transactions scheduled for the next {daysAhead} days.
          </p>
        </div>
      </Card>
    );
  }

  const totalUpcomingIncome = upcomingTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalUpcomingExpenses = upcomingTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const formatDate = (date: Date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays <= 7) return date.toLocaleDateString('en-US', { weekday: 'long' });
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric'
    });
  };

  const groupByDate = (transactions: typeof upcomingTransactions) => {
    const groups: { [key: string]: typeof upcomingTransactions } = {};
    
    transactions.forEach(transaction => {
      const dateKey = transaction.dueDate.toDateString();
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(transaction);
    });
    
    return Object.entries(groups)
      .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
      .map(([dateKey, transactions]) => ({
        date: new Date(dateKey),
        transactions: transactions.sort((a, b) => a.amount - b.amount)
      }));
  };

  const groupedTransactions = groupByDate(upcomingTransactions);

  return (
    <Card title={`Upcoming Transactions (Next ${daysAhead} Days)`}>
      {/* Summary */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr 1fr', 
        gap: '15px',
        marginBottom: '20px',
        padding: '15px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        border: '1px solid #e9ecef',
        textAlign: 'center'
      }}>
        <div>
          <div style={{ fontSize: '0.9em', color: '#666', marginBottom: '5px' }}>Expected Income</div>
          <div style={{ fontSize: '1.2em', fontWeight: 'bold', color: '#28a745' }}>
            ${totalUpcomingIncome.toFixed(2)}
          </div>
        </div>
        <div>
          <div style={{ fontSize: '0.9em', color: '#666', marginBottom: '5px' }}>Expected Expenses</div>
          <div style={{ fontSize: '1.2em', fontWeight: 'bold', color: '#dc3545' }}>
            ${totalUpcomingExpenses.toFixed(2)}
          </div>
        </div>
        <div>
          <div style={{ fontSize: '0.9em', color: '#666', marginBottom: '5px' }}>Net Impact</div>
          <div style={{ 
            fontSize: '1.2em', 
            fontWeight: 'bold', 
            color: (totalUpcomingIncome - totalUpcomingExpenses) >= 0 ? '#28a745' : '#dc3545'
          }}>
            ${(totalUpcomingIncome - totalUpcomingExpenses).toFixed(2)}
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div>
        {groupedTransactions.map(({ date, transactions }) => (
          <div key={date.toDateString()} style={{ marginBottom: '20px' }}>
            <h5 style={{ 
              margin: '0 0 10px 0',
              padding: '8px 12px',
              backgroundColor: '#e9ecef',
              borderRadius: '4px',
              color: '#495057'
            }}>
              {formatDate(date)} ({date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})
            </h5>
            
            <div style={{ marginLeft: '15px' }}>
              {transactions.map(transaction => (
                <div 
                  key={`${transaction.id}-${date.getTime()}`}
                  style={{ 
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 12px',
                    marginBottom: '8px',
                    backgroundColor: transaction.type === 'income' ? '#d4edda' : '#f8d7da',
                    borderRadius: '4px',
                    borderLeft: `3px solid ${transaction.type === 'income' ? '#28a745' : '#dc3545'}`
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 'bold', fontSize: '0.9em' }}>
                      {transaction.description}
                    </div>
                    <div style={{ fontSize: '0.8em', color: '#666' }}>
                      {formatFrequency(transaction.frequency)}
                      {transaction.category && ` • ${transaction.category}`}
                    </div>
                  </div>
                  
                  <div style={{ 
                    fontWeight: 'bold',
                    color: transaction.type === 'income' ? '#155724' : '#721c24'
                  }}>
                    {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div style={{ 
        marginTop: '15px',
        padding: '12px',
        backgroundColor: '#d1ecf1',
        borderRadius: '4px',
        fontSize: '0.9em',
        color: '#0c5460'
      }}>
        <strong>💡 Forecast:</strong> This preview shows your scheduled recurring transactions. 
        Actual amounts may vary based on when transactions are generated.
      </div>
    </Card>
  );
}

export default UpcomingTransactions;