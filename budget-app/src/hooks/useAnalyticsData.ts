// src/hooks/useAnalyticsData.ts
import { useCollection } from "react-firebase-hooks/firestore";
import { collection, query, where } from "firebase/firestore";
import { db, auth } from "../services/firebase";
import { useMemo } from "react";
import type { Transaction, DateRange, ComparisonMode } from "../types";
import { subMonths, subYears, differenceInDays } from 'date-fns';

const useAnalyticsCollection = (collectionName: string, dateRange: DateRange | null) => {
  const collectionRef = collection(db, collectionName);

  const q = useMemo(() => {
    if (!auth.currentUser || !dateRange) {
      return query(collectionRef, where("userId", "==", "null"));
    }
    return query(
      collectionRef,
      where("userId", "==", auth.currentUser.uid),
      where("createdAt", ">=", dateRange.start),
      where("createdAt", "<=", dateRange.end)
    );
  }, [collectionName, dateRange]);
 
   const [snapshot, loading, error] = useCollection(q);

   const data = useMemo(() => {
    if (!snapshot) return [];
    return snapshot.docs.map((doc) => {
      const docData = doc.data();
      return {
        id: doc.id,
        ...docData,
      } as Transaction;
    });
  }, [snapshot]);

  return { data, loading, error };
};

const getPreviousDateRange = (dateRange: DateRange, mode: ComparisonMode): DateRange | null => {
  if (mode === 'none') return null;

  const { start, end } = dateRange;
  if (mode === 'yoy') {
    return {
      start: subYears(start, 1),
      end: subYears(end, 1),
    };
  }

  if (mode === 'mom') {
    const days = differenceInDays(end, start);
    return {
      start: subMonths(start, 1),
      end: subMonths(end, 1),
    };
  }

  return null;
};

export const useAnalyticsData = (
  dateRange: DateRange | null,
  comparison: ComparisonMode = 'none'
) => {
  // Fetch data for the current period
  const { data: income, loading: incomeLoading, error: incomeError } = useAnalyticsCollection("income", dateRange);
  const { data: expenses, loading: expensesLoading, error: expensesError } = useAnalyticsCollection("expenses", dateRange);

  // Fetch data for the previous period if a comparison is active
  const previousDateRange = useMemo(
    () => (dateRange ? getPreviousDateRange(dateRange, comparison) : null),
    [dateRange, comparison]
  );

  const { data: prevIncome, loading: prevIncomeLoading, error: prevIncomeError } = useAnalyticsCollection("income", previousDateRange);
  const { data: prevExpenses, loading: prevExpensesLoading, error: prevExpensesError } = useAnalyticsCollection("expenses", previousDateRange);

  return {
    current: {
      income,
      expenses,
    },
    previous: {
      income: prevIncome,
      expenses: prevExpenses,
    },
    loading: incomeLoading || expensesLoading || prevIncomeLoading || prevExpensesLoading,
    error: incomeError || expensesError || prevIncomeError || prevExpensesError,
  };
};