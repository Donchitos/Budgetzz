import type { DateRange } from "../types";
import { Timestamp } from "firebase/firestore";

/**
 * Get the first and last day of a given month
 */
export const getMonthRange = (date: Date): DateRange => {
  const year = date.getFullYear();
  const month = date.getMonth();

  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0, 23, 59, 59, 999);

  return { start, end };
};

/**
 * Format a date range for display
 */
export const formatDateRange = (range: DateRange): string => {
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const month = monthNames[range.start.getMonth()];
  const year = range.start.getFullYear();

  return `${month} ${year}`;
};

/**
 * Check if a timestamp falls within a date range
 */
export const isDateInRange = (
  timestamp: Timestamp | Date,
  range: DateRange
): boolean => {
  if (!timestamp) return false;

  const date =
    timestamp instanceof Timestamp ? timestamp.toDate() : timestamp;

  return date >= range.start && date <= range.end;
};

/**
 * Get the current month as a Date object (first day of current month)
 */
export const getCurrentMonth = (): Date => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
};

/**
 * Generate a budget ID for a specific month and category
 */
export const generateBudgetId = (
  userId: string,
  category: string,
  date: Date
): string => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1; // 1-based month
  return `${userId}_${category}_${year}_${month.toString().padStart(2, "0")}`;
};

/**
 * Format date for display in transactions
 */
export const formatTransactionDate = (timestamp: Timestamp | Date): string => {
  const date =
    timestamp instanceof Timestamp ? timestamp.toDate() : timestamp;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};