import { Timestamp } from "firebase/firestore";

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  category?: string;
  createdAt: Timestamp | Date;
  userId: string;
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