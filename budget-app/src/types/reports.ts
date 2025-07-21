// src/types/reports.ts
import type { Transaction } from './index';

// This represents a transaction prepared for the report,
// where the 'type' property is a capitalized string.
export interface ReportTransaction extends Omit<Transaction, 'type'> {
  type: 'Income' | 'Expense';
}