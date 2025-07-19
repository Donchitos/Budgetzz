// src/utils/recurringUtils.ts
import type { RecurringTransaction } from '../types';

export type FrequencyType = 'weekly' | 'bi-weekly' | 'monthly' | 'yearly';

/**
 * Calculate the next due date based on current date and frequency
 */
export const calculateNextDueDate = (currentDate: Date, frequency: FrequencyType): Date => {
  const nextDate = new Date(currentDate);
  
  switch (frequency) {
    case 'weekly':
      nextDate.setDate(nextDate.getDate() + 7);
      break;
    case 'bi-weekly':
      nextDate.setDate(nextDate.getDate() + 14);
      break;
    case 'monthly':
      nextDate.setMonth(nextDate.getMonth() + 1);
      break;
    case 'yearly':
      nextDate.setFullYear(nextDate.getFullYear() + 1);
      break;
  }
  
  return nextDate;
};

/**
 * Check if a recurring transaction is due (next due date is today or in the past)
 */
export const isTransactionDue = (recurringTransaction: RecurringTransaction): boolean => {
  if (!recurringTransaction.isActive) return false;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset time to start of day
  
  const nextDueDate = recurringTransaction.nextDueDate instanceof Date 
    ? recurringTransaction.nextDueDate 
    : recurringTransaction.nextDueDate.toDate();
  
  nextDueDate.setHours(0, 0, 0, 0); // Reset time to start of day
  
  // Check if transaction has ended
  if (recurringTransaction.endDate) {
    const endDate = recurringTransaction.endDate instanceof Date 
      ? recurringTransaction.endDate 
      : recurringTransaction.endDate.toDate();
    
    if (today > endDate) return false;
  }
  
  return nextDueDate <= today;
};

/**
 * Get all recurring transactions that are due
 */
export const getDueRecurringTransactions = (recurringTransactions: RecurringTransaction[]): RecurringTransaction[] => {
  return recurringTransactions.filter(isTransactionDue);
};

/**
 * Generate a transaction object from a recurring transaction
 */
export const generateTransactionFromRecurring = (recurringTransaction: RecurringTransaction) => {
  return {
    description: recurringTransaction.description,
    amount: recurringTransaction.amount,
    category: recurringTransaction.category,
    type: recurringTransaction.type,
    recurringId: recurringTransaction.id,
    userId: recurringTransaction.userId,
    scheduledDate: new Date() // Today's date
  };
};

/**
 * Get upcoming recurring transactions for the next N days
 */
export const getUpcomingRecurringTransactions = (
  recurringTransactions: RecurringTransaction[], 
  daysAhead: number = 7
): Array<RecurringTransaction & { dueDate: Date }> => {
  const today = new Date();
  const futureDate = new Date(today);
  futureDate.setDate(futureDate.getDate() + daysAhead);
  
  return recurringTransactions
    .filter(rt => rt.isActive)
    .map(rt => {
      const nextDueDate = rt.nextDueDate instanceof Date 
        ? rt.nextDueDate 
        : rt.nextDueDate.toDate();
      
      return {
        ...rt,
        dueDate: nextDueDate
      };
    })
    .filter(rt => rt.dueDate >= today && rt.dueDate <= futureDate)
    .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
};

/**
 * Calculate how many times a recurring transaction should have occurred
 * between its last due date and now (for missed transactions)
 */
export const calculateMissedOccurrences = (recurringTransaction: RecurringTransaction): number => {
  if (!recurringTransaction.isActive) return 0;
  
  const today = new Date();
  let nextDueDate = recurringTransaction.nextDueDate instanceof Date 
    ? new Date(recurringTransaction.nextDueDate) 
    : recurringTransaction.nextDueDate.toDate();
  
  let missedCount = 0;
  
  while (nextDueDate < today) {
    missedCount++;
    nextDueDate = calculateNextDueDate(nextDueDate, recurringTransaction.frequency);
    
    // Safety check to prevent infinite loops
    if (missedCount > 365) break; // Max 1 year worth of missed transactions
  }
  
  return missedCount;
};

/**
 * Format frequency for display
 */
export const formatFrequency = (frequency: FrequencyType): string => {
  const frequencyMap = {
    'weekly': 'Weekly',
    'bi-weekly': 'Bi-weekly',
    'monthly': 'Monthly',
    'yearly': 'Yearly'
  };
  
  return frequencyMap[frequency] || frequency;
};

/**
 * Get the next few occurrence dates for a recurring transaction
 */
export const getNextOccurrences = (
  recurringTransaction: RecurringTransaction, 
  count: number = 3
): Date[] => {
  const occurrences: Date[] = [];
  let currentDate = recurringTransaction.nextDueDate instanceof Date 
    ? new Date(recurringTransaction.nextDueDate) 
    : recurringTransaction.nextDueDate.toDate();
  
  for (let i = 0; i < count; i++) {
    // Check if we've exceeded the end date
    if (recurringTransaction.endDate) {
      const endDate = recurringTransaction.endDate instanceof Date 
        ? recurringTransaction.endDate 
        : recurringTransaction.endDate.toDate();
      
      if (currentDate > endDate) break;
    }
    
    occurrences.push(new Date(currentDate));
    currentDate = calculateNextDueDate(currentDate, recurringTransaction.frequency);
  }
  
  return occurrences;
};