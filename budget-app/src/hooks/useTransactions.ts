import { collection, query, where, deleteDoc, doc, addDoc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "../services/firebase";
import { useMemo } from "react";
import { isDateInRange, getMonthRange } from "../utils/dateUtils";
import type { Transaction } from "../types";
import useFirestoreCollection from "./useFirestoreCollection";

export const useTransactions = (selectedPeriod: Date) => {
  const { snapshot: incomeSnapshot, loading: incomeLoading, error: incomeError } = useFirestoreCollection("income");
  const { snapshot: expensesSnapshot, loading: expensesLoading, error: expensesError } = useFirestoreCollection("expenses");

  const income = useMemo(() => {
    if (!incomeSnapshot) return [];
    return incomeSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  }, [incomeSnapshot]);

  const expenses = useMemo(() => {
    if (!expensesSnapshot) return [];
    return expensesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  }, [expensesSnapshot]);

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

  const totalIncome = useMemo(
    () => filteredIncome.reduce((sum, item) => sum + item.amount, 0),
    [filteredIncome]
  );

  const totalExpenses = useMemo(
    () => filteredExpenses.reduce((sum, item) => sum + item.amount, 0),
    [filteredExpenses]
  );

  const addTransaction = async (
    collectionName: "income" | "expenses",
    description: string,
    amount: number,
    category?: string
  ) => {
    if (!auth.currentUser) {
      throw new Error("You must be logged in to add a transaction.");
    }
    await addDoc(collection(db, collectionName), {
      userId: auth.currentUser.uid,
      description,
      amount,
      category,
      createdAt: serverTimestamp(),
    });
  };

  const deleteTransaction = async (id: string) => {
    try {
      const incomeDoc = (income as Transaction[]).find(t => t.id === id);
      if (incomeDoc) {
        await deleteDoc(doc(db, "income", id));
        return;
      }

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
    totalIncome,
    totalExpenses,
    loading: incomeLoading || expensesLoading,
    error: incomeError || expensesError,
    addTransaction,
    deleteTransaction,
  };
};