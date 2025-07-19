import { useCollection } from "react-firebase-hooks/firestore";
import { collection, query, where } from "firebase/firestore";
import { db, auth } from "../services/firebase";
import { useMemo } from "react";
import { isDateInRange, getMonthRange } from "../utils/dateUtils";
import type { Transaction, Budget } from "../types";

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

  return { data, loading, error };
};

export const useData = (selectedPeriod: Date) => {
  const { data: income, loading: incomeLoading, error: incomeError } = useFirestoreCollection("income");
  const { data: expenses, loading: expensesLoading, error: expensesError } = useFirestoreCollection("expenses");
  const { data: budgets, loading: budgetsLoading, error: budgetsError } = useFirestoreCollection("budgets");

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

  const totalIncome = useMemo(
    () => filteredIncome.reduce((sum, item) => sum + item.amount, 0),
    [filteredIncome]
  );

  const totalExpenses = useMemo(
    () => filteredExpenses.reduce((sum, item) => sum + item.amount, 0),
    [filteredExpenses]
  );

  return {
    income: filteredIncome,
    expenses: filteredExpenses,
    budgets: filteredBudgets,
    totalIncome,
    totalExpenses,
    loading: incomeLoading || expensesLoading || budgetsLoading,
    error: incomeError || expensesError || budgetsError,
  };
};