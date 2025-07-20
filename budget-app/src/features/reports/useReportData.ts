import { useState, useMemo } from 'react';
import { subMonths, startOfDay, endOfDay } from 'date-fns';
import type { DateRange, ComparisonMode, Transaction } from '../../types';
import { useAnalyticsData } from '../../hooks/useAnalyticsData';
import type { ReportFilters } from './AdvancedFilterControls';

export const useReportData = () => {
  const [dateRange, setDateRange] = useState<DateRange>({
    start: startOfDay(subMonths(new Date(), 6)),
    end: endOfDay(new Date()),
  });
  const [comparison, setComparison] = useState<ComparisonMode>('none');
  const [filters, setFilters] = useState<ReportFilters>({
    searchTerm: '',
    categories: [],
  });

  const { current, previous, loading, error } = useAnalyticsData(dateRange, comparison);

  const filteredData = useMemo(() => {
    const filterTransactions = (transactions: Transaction[]): Transaction[] => {
      return transactions.filter(t => {
        const searchTermMatch = filters.searchTerm
          ? t.description.toLowerCase().includes(filters.searchTerm.toLowerCase())
          : true;
        const categoryMatch = filters.categories.length > 0
          ? t.category && filters.categories.includes(t.category)
          : true;
        return searchTermMatch && categoryMatch;
      });
    };

    return {
      current: {
        income: filterTransactions(current.income),
        expenses: filterTransactions(current.expenses),
      },
      previous: {
        income: filterTransactions(previous.income),
        expenses: filterTransactions(previous.expenses),
      }
    };
  }, [current, previous, filters]);

  const availableCategories = useMemo(() => {
    const allCategories = new Set<string>();
    current.expenses.forEach(e => {
      if (e.category) allCategories.add(e.category);
    });
    previous.expenses.forEach(e => {
      if (e.category) allCategories.add(e.category);
    });
    return Array.from(allCategories).sort();
  }, [current.expenses, previous.expenses]);

  return {
    dateRange,
    setDateRange,
    comparison,
    setComparison,
    filters,
    setFilters,
    filteredData,
    availableCategories,
    loading,
    error,
    originalData: { current, previous },
  };
};