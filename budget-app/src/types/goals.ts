export type GoalCategory =
  | 'emergency-fund'
  | 'vacation'
  | 'house-down-payment'
  | 'car'
  | 'education'
  | 'retirement'
  | 'debt-payoff'
  | 'technology'
  | 'other';

export type GoalPriority = 'high' | 'medium' | 'low' | 'critical';

export interface FinancialGoal {
  id: string;
  userId: string;
  title: string;
  description?: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string; // ISO 8601 date string
  priority: GoalPriority;
  category: GoalCategory;
  isCompleted: boolean;
  createdAt: string; // ISO 8601 date string
  updatedAt: string; // ISO 8601 date string
  lastNotifiedMilestone?: number;
  deadlineNotified?: boolean;
}

export interface GoalContribution {
  id: string;
  goalId: string;
  userId: string;
  amount: number;
  date: string; // ISO 8601 date string
}