import type { RecurringTransaction } from '../types';
import { getUpcomingRecurringTransactions } from '../types/recurringUtils';

interface ProjectionPoint {
  date: Date;
  balance: number;
  transactions: RecurringTransaction[];
}

export function calculateBalanceProjection(
  currentBalance: number,
  recurringTransactions: RecurringTransaction[],
  daysToProject: number
): ProjectionPoint[] {
  const projection: ProjectionPoint[] = [];
  let projectedBalance = currentBalance;
  const today = new Date();

  // Add the starting balance
  projection.push({ date: today, balance: projectedBalance, transactions: [] });

  for (let i = 1; i <= daysToProject; i++) {
    const futureDate = new Date(today);
    futureDate.setDate(today.getDate() + i);

    const upcomingForDay = getUpcomingRecurringTransactions(recurringTransactions, i);

    // Filter for transactions that are due on this specific day
    const transactionsForDay = upcomingForDay.filter(t => {
        const dueDate = t.dueDate;
        return dueDate.getFullYear() === futureDate.getFullYear() &&
               dueDate.getMonth() === futureDate.getMonth() &&
               dueDate.getDate() === futureDate.getDate();
    });

    let dailyNet = 0;
    transactionsForDay.forEach(transaction => {
      if (transaction.type === 'income') {
        dailyNet += transaction.amount;
      } else {
        dailyNet -= transaction.amount;
      }
    });

    if (transactionsForDay.length > 0) {
        projectedBalance += dailyNet;
    }

    projection.push({ date: futureDate, balance: projectedBalance, transactions: transactionsForDay });
  }

  return projection;
}