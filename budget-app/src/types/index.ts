// src/types/index.ts
import { Timestamp } from "firebase/firestore";

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  category?: string;
  createdAt: Timestamp | Date;
  userId: string;
  recurringId?: string; // Link to recurring transaction if auto-generated
  type: 'income' | 'expense';
}

export interface Budget {
  id: string;
  category: string;
  budgetAmount: number;
  month: number;
  year: number;
  userId: string;
}

export interface DateRange {
  start: Date;
  end: Date;
}

export type ComparisonMode = 'none' | 'mom' | 'yoy';
export type FrequencyType = 'weekly' | 'bi-weekly' | 'monthly' | 'yearly';

export interface RecurringTransaction {
  id: string;
  type: 'income' | 'expense';
  description: string;
  amount: number;
  category?: string; // Only for expenses
  frequency: FrequencyType;
  startDate: Timestamp | Date;
  endDate?: Timestamp | Date; // Optional - if not set, continues indefinitely
  isActive: boolean;
  nextDueDate: Timestamp | Date;
  userId: string;
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
}

export interface NewRecurringTransaction {
  type: 'income' | 'expense';
  description: string;
  amount: number;
  category?: string;
  frequency: FrequencyType;
  startDate: Date;
  endDate: Date | null;
  isActive: boolean;
  nextDueDate: Date;
  userId: string;
  createdAt: any; // Special type for server-generated timestamps
  updatedAt: any;
}

export interface PendingTransaction {
  id: string;
  recurringId: string;
  type: 'income' | 'expense';
  description: string;
  amount: number;
  category?: string;
  scheduledDate: Date;
  isReviewed: boolean;
  userId: string;
}