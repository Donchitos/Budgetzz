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
        <div className="text-center p-5 text-gray-600">
          <div className="text-3xl mb-2">📅</div>
          <p className="m-0 text-sm">
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
      <div className="grid grid-cols-3 gap-4 mb-5 p-4 bg-gray-50 rounded-lg border border-gray-200 text-center">
        <div>
          <div className="text-sm text-gray-600 mb-1">Expected Income</div>
          <div className="text-lg font-bold text-green-600">
            ${totalUpcomingIncome.toFixed(2)}
          </div>
        </div>
        <div>
          <div className="text-sm text-gray-600 mb-1">Expected Expenses</div>
          <div className="text-lg font-bold text-red-600">
            ${totalUpcomingExpenses.toFixed(2)}
          </div>
        </div>
        <div>
          <div className="text-sm text-gray-600 mb-1">Net Impact</div>
          <div className={`text-lg font-bold ${(totalUpcomingIncome - totalUpcomingExpenses) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            ${(totalUpcomingIncome - totalUpcomingExpenses).toFixed(2)}
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div>
        {groupedTransactions.map(({ date, transactions }) => (
          <div key={date.toDateString()} className="mb-5">
            <h5 className="m-0 mb-2 p-2 bg-gray-200 rounded text-gray-700">
              {formatDate(date)} ({date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})
            </h5>
            
            <div className="ml-4">
              {transactions.map(transaction => (
                <div
                  key={`${transaction.id}-${date.getTime()}`}
                  className={`flex justify-between items-center p-2 mb-2 rounded ${
                    transaction.type === 'income' ? 'bg-green-100 border-l-4 border-green-500' : 'bg-red-100 border-l-4 border-red-500'
                  }`}
                >
                  <div className="flex-1">
                    <div className="font-bold text-sm">
                      {transaction.description}
                    </div>
                    <div className="text-xs text-gray-600">
                      {formatFrequency(transaction.frequency)}
                      {transaction.category && ` • ${transaction.category}`}
                    </div>
                  </div>
                  
                  <div className={`font-bold ${
                    transaction.type === 'income' ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 p-3 bg-blue-100 rounded text-sm text-blue-800">
        <strong>💡 Forecast:</strong> This preview shows your scheduled recurring transactions.
        Actual amounts may vary based on when transactions are generated.
      </div>
    </Card>
  );
}

export default UpcomingTransactions;