// src/features/dashboard/useDashboardData.ts
import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import useFirestoreCollection from '../../hooks/useFirestoreCollection';
import type { RecurringTransaction, Transaction, Budget, FinancialGoal } from '../../types';
import { Timestamp } from 'firebase/firestore';

interface DashboardTransaction {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  type: 'income' | 'expense';
}

interface CategoryData {
  category: string;
  amount: number;
  budget: number;
  color: string;
}

export const useDashboardData = () => {
  const { user } = useAuth();
  const [balance, setBalance] = useState<number | null>(null);
  const [monthlyIncome, setMonthlyIncome] = useState<number>(0);
  const [monthlyExpenses, setMonthlyExpenses] = useState<number>(0);
  const [lastMonthExpenses, setLastMonthExpenses] = useState<number>(0);
  const [emergencyFundCoverage, setEmergencyFundCoverage] = useState<number>(0);
  const [recentTransactions, setRecentTransactions] = useState<DashboardTransaction[]>([]);
  const [categorySpending, setCategorySpending] = useState<CategoryData[]>([]);
  const [totalBudget, setTotalBudget] = useState<number>(0);
  const [totalSpent, setTotalSpent] = useState<number>(0);
  const [savingsGoalProgress, setSavingsGoalProgress] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  // Existing hooks
  const { snapshot: recurringSnapshot } = useFirestoreCollection('recurring-transactions');
  const { snapshot: incomeSnapshot } = useFirestoreCollection('income');
  const { snapshot: expensesSnapshot } = useFirestoreCollection('expenses');
  const { snapshot: budgetsSnapshot } = useFirestoreCollection('budgets');
  const { snapshot: goalsSnapshot } = useFirestoreCollection('financial-goals');

  const allRecurring = recurringSnapshot?.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as RecurringTransaction)) || [];

  useEffect(() => {
    if (!user || !incomeSnapshot || !expensesSnapshot || !goalsSnapshot) {
      setLoading(false);
      return;
    }

    try {
      // Calculate current month data
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      
      // Last month
      const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

      // Process income
      const incomeData = incomeSnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as Transaction))
        .filter(income => income.userId === user.uid);

      // Process expenses
      const expenseData = expensesSnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as Transaction))
        .filter(expense => expense.userId === user.uid);

      // Calculate monthly income
      const currentMonthIncome = incomeData
        .filter(income => {
          const incomeDate = income.createdAt instanceof Timestamp ? income.createdAt.toDate() : income.createdAt || new Date();
          return incomeDate.getMonth() === currentMonth &&
                 incomeDate.getFullYear() === currentYear;
        })
        .reduce((sum, income) => sum + (income.amount || 0), 0);

      // Calculate monthly expenses
      const currentMonthExpenses = expenseData
        .filter(expense => {
          const expenseDate = expense.createdAt instanceof Timestamp ? expense.createdAt.toDate() : expense.createdAt || new Date();
          return expenseDate.getMonth() === currentMonth &&
                 expenseDate.getFullYear() === currentYear;
        })
        .reduce((sum, expense) => sum + (expense.amount || 0), 0);

      // Calculate last month expenses
      const lastMonthExpensesTotal = expenseData
        .filter(expense => {
          const expenseDate = expense.createdAt instanceof Timestamp ? expense.createdAt.toDate() : expense.createdAt || new Date();
          return expenseDate.getMonth() === lastMonth &&
                 expenseDate.getFullYear() === lastMonthYear;
        })
        .reduce((sum, expense) => sum + (expense.amount || 0), 0);

      // Calculate total balance
      const totalIncome = incomeData.reduce((sum, income) => sum + (income.amount || 0), 0);
      const totalExpenses = expenseData.reduce((sum, expense) => sum + (expense.amount || 0), 0);
      const currentBalance = totalIncome - totalExpenses;

      // Calculate emergency fund coverage
      const emergencyFund = currentBalance; // Simplified - you might have a separate emergency fund tracker
      const coverage = currentMonthExpenses > 0 ? emergencyFund / currentMonthExpenses : 0;

      // Get recent transactions (last 10)
      const allTransactions: DashboardTransaction[] = [
        ...incomeData.map(income => ({
          id: income.id,
          description: income.description || 'Income',
          amount: income.amount || 0,
          category: income.category || 'Income',
          date: (income.createdAt instanceof Timestamp ? income.createdAt.toDate() : income.createdAt || new Date()).toISOString().split('T')[0],
          type: 'income' as const
        })),
        ...expenseData.map(expense => ({
          id: expense.id,
          description: expense.description || 'Expense',
          amount: -(expense.amount || 0),
          category: expense.category || 'Other',
          date: (expense.createdAt instanceof Timestamp ? expense.createdAt.toDate() : expense.createdAt || new Date()).toISOString().split('T')[0],
          type: 'expense' as const
        }))
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10);

      // Calculate category spending
      const categoryMap = new Map<string, number>();
      expenseData
        .filter(expense => {
          const expenseDate = expense.createdAt instanceof Timestamp ? expense.createdAt.toDate() : expense.createdAt || new Date();
          return expenseDate.getMonth() === currentMonth &&
                 expenseDate.getFullYear() === currentYear;
        })
        .forEach(expense => {
          const category = expense.category || 'Other';
          categoryMap.set(category, (categoryMap.get(category) || 0) + (expense.amount || 0));
        });

      // Get budgets (you'll need to implement this based on your budget structure)
      const budgetData = budgetsSnapshot?.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as Budget))
        .filter(budget => budget.userId === user.uid) || [];

      // Create category spending with budgets
      const categoryColors = [
        '#E74C3C', '#3498DB', '#9B59B6', '#F39C12', '#2ECC71',
        '#E67E22', '#1ABC9C', '#34495E', '#F1C40F', '#8E44AD'
      ];

      const categories: CategoryData[] = Array.from(categoryMap.entries()).map(([category, amount], index) => {
        const budget = budgetData.find(b => b.category === category)?.budgetAmount || amount * 1.2; // Default budget 20% higher than current spending
        return {
          category,
          amount,
          budget,
          color: categoryColors[index % categoryColors.length]
        };
      });

      const totalCategoryBudget = categories.reduce((sum, cat) => sum + cat.budget, 0);
      const totalCategorySpent = categories.reduce((sum, cat) => sum + cat.amount, 0);

      // Calculate savings goal progress
      const goals = goalsSnapshot.docs
        .map(doc => doc.data() as FinancialGoal)
        .filter(goal => goal.userId === user.uid);
      
      const totalGoalTarget = goals.reduce((sum, goal) => sum + (goal.targetAmount || 0), 0);
      const totalGoalCurrent = goals.reduce((sum, goal) => sum + (goal.currentAmount || 0), 0);
      const savingsProgress = totalGoalTarget > 0 ? (totalGoalCurrent / totalGoalTarget) * 100 : 0;

      // Update state
      setBalance(currentBalance);
      setMonthlyIncome(currentMonthIncome);
      setMonthlyExpenses(currentMonthExpenses);
      setLastMonthExpenses(lastMonthExpensesTotal);
      setEmergencyFundCoverage(coverage);
      setRecentTransactions(allTransactions);
      setCategorySpending(categories);
      setTotalBudget(totalCategoryBudget);
      setTotalSpent(totalCategorySpent);
      setSavingsGoalProgress(savingsProgress);
      setLoading(false);

    } catch (error) {
      console.error('Error processing dashboard data:', error);
      setLoading(false);
    }
  }, [user, incomeSnapshot, expensesSnapshot, budgetsSnapshot, goalsSnapshot]);

  return {
    balance,
    allRecurring,
    loading,
    monthlyIncome,
    monthlyExpenses,
    lastMonthExpenses,
    emergencyFundCoverage,
    recentTransactions,
    categorySpending,
    totalBudget,
    totalSpent,
    savingsGoalProgress,
  };
};