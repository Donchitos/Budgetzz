// src/hooks/useData.ts
import { useCollection } from "react-firebase-hooks/firestore";
import { collection, query, where, deleteDoc, doc } from "firebase/firestore";
import { db, auth } from "../services/firebase";
import { useMemo } from "react";
import { isDateInRange, getMonthRange } from "../utils/dateUtils";
import { getDueRecurringTransactions } from "../types/recurringUtils";
import type { Transaction, Budget, RecurringTransaction } from "../types";

const useFirestoreCollection = (collectionName: string) => {
  const collectionRef = collection(db, collectionName);
  const q = auth.currentUser
    ? query(collectionRef, where("userId", "==", auth.currentUser.uid))
    : query(collectionRef);
  const [snapshot, loading, error] = useCollection(q);

  const data = useMemo(() => {
    if (!snapshot) return [];
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  }, [snapshot]);

  return { data, loading, error, snapshot };
};

export const useData = (selectedPeriod: Date) => {
  const { data: income, loading: incomeLoading, error: incomeError } = useFirestoreCollection("income");
  const { data: expenses, loading: expensesLoading, error: expensesError } = useFirestoreCollection("expenses");
  const { data: budgets, loading: budgetsLoading, error: budgetsError } = useFirestoreCollection("budgets");
  const { data: recurringTransactions, loading: recurringLoading, error: recurringError } = useFirestoreCollection("recurring-transactions");

  const dateRange = getMonthRange(selectedPeriod);

  const filteredIncome = useMemo(
    () =>
      (income as Transaction[]).filter((item) =>
        isDateInRange(item.createdAt, dateRange)
      ),
    [income, dateRange]
  );

  const filteredExpenses = useMemo(
    () =>
      (expenses as Transaction[]).filter((item) =>
        isDateInRange(item.createdAt, dateRange)
      ),
    [expenses, dateRange]
  );

  const filteredBudgets = useMemo(
    () =>
      (budgets as Budget[]).filter(
        (budget) =>
          budget.month === selectedPeriod.getMonth() &&
          budget.year === selectedPeriod.getFullYear()
      ),
    [budgets, selectedPeriod]
  );

  const dueRecurringTransactions = useMemo(
    () => getDueRecurringTransactions(recurringTransactions as RecurringTransaction[]),
    [recurringTransactions]
  );

  const totalIncome = useMemo(
    () => filteredIncome.reduce((sum, item) => sum + item.amount, 0),
    [filteredIncome]
  );

  const totalExpenses = useMemo(
    () => filteredExpenses.reduce((sum, item) => sum + item.amount, 0),
    [filteredExpenses]
  );

  const totalRecurringIncome = useMemo(
    () => (recurringTransactions as RecurringTransaction[])
      .filter(rt => rt.isActive && rt.type === 'income')
      .reduce((sum, rt) => sum + rt.amount, 0),
    [recurringTransactions]
  );

  const totalRecurringExpenses = useMemo(
    () => (recurringTransactions as RecurringTransaction[])
      .filter(rt => rt.isActive && rt.type === 'expense')
      .reduce((sum, rt) => sum + rt.amount, 0),
    [recurringTransactions]
  );

  const deleteTransaction = async (id: string) => {
    try {
      // Check if the transaction exists in income
      const incomeDoc = (income as Transaction[]).find(t => t.id === id);
      if (incomeDoc) {
        await deleteDoc(doc(db, "income", id));
        return;
      }
  
      // Check if the transaction exists in expenses
      const expenseDoc = (expenses as Transaction[]).find(t => t.id === id);
      if (expenseDoc) {
        await deleteDoc(doc(db, "expenses", id));
        return;
      }
  
      console.warn(`Transaction with id ${id} not found in income or expenses.`);
    } catch (error) {
      console.error("Error deleting transaction: ", error);
    }
  };

  return {
    income: filteredIncome,
    expenses: filteredExpenses,
    budgets: filteredBudgets,
    recurringTransactions: recurringTransactions as RecurringTransaction[],
    dueRecurringTransactions,
    totalIncome,
    totalExpenses,
    totalRecurringIncome,
    totalRecurringExpenses,
    loading: incomeLoading || expensesLoading || budgetsLoading || recurringLoading,
    error: incomeError || expensesError || budgetsError || recurringError,
    deleteTransaction,
  };
};