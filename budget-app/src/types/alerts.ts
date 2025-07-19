import { Timestamp } from "firebase/firestore";

export type AlertType = 'BUDGET_THRESHOLD' | 'BILL_DUE' | 'GOAL_PROGRESS' | 'UNUSUAL_SPENDING';
export type BillDueTiming = 'ON_DUE_DATE' | '1_DAY_BEFORE' | '3_DAYS_BEFORE' | '7_DAYS_BEFORE';

export interface AlertRule {
  id: string;
  userId: string;
  alertType: AlertType;
  // For BUDGET_THRESHOLD
  budgetId?: string; 
  threshold?: number; // e.g., 80 for 80%
  // For BILL_DUE
  recurringTransactionId?: string;
  timing?: BillDueTiming;
  // For GOAL_PROGRESS
  goalId?: string;
  // Common fields
  isEnabled: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface UserNotificationPreference {
  id: string; // Same as userId for a 1:1 relationship
  userId: string;
  channels: {
    email: { isEnabled: boolean; address: string; };
    push: { isEnabled: boolean; };
    inApp: { isEnabled: boolean; };
  };
  doNotDisturb: {
    isEnabled: boolean;
    startTime: string; // e.g., "22:00"
    endTime: string;   // e.g., "08:00"
  };
  updatedAt: Timestamp;
}

export type DeliveryStatus = 'pending' | 'sent' | 'delivered' | 'failed';

export interface Notification {
  id: string;
  userId: string;
  alertRuleId: string;
  content: {
    title: string;
    body: string;
  };
  status: {
    delivery: 'processed' | 'pending';
    email: DeliveryStatus;
    push: DeliveryStatus;
    inApp: DeliveryStatus;
    seen: boolean;
    dismissed: boolean;
  };
  isArchived: boolean;
  createdAt: Timestamp;
}