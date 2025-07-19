// src/features/reports/ReportsPage.tsx
import React, { useState, useMemo } from 'react';
import { subMonths, startOfDay, endOfDay } from 'date-fns';
import type { DateRange, ComparisonMode, Transaction } from '../../types';
import { useAnalyticsData } from '../../hooks/useAnalyticsData';
import DateRangeSelector from './DateRangeSelector';
import TrendChart from './TrendChart';
import CategoryBreakdown from './CategoryBreakdown';
import AdvancedFilterControls from './AdvancedFilterControls';
import type { ReportFilters } from './AdvancedFilterControls';
import ReportExporter from './ReportExporter';

const ReportsPage: React.FC = () => {
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

  if (loading) return <p>Loading reports...</p>;
  if (error) return <p>Error loading reports: {error.message}</p>;

  return (
    <div>
      <h2>Advanced Reports</h2>
      <DateRangeSelector
        onDateRangeChange={setDateRange}
        onComparisonChange={setComparison}
        currentComparison={comparison}
      />
      <AdvancedFilterControls
        availableCategories={availableCategories}
        filters={filters}
        onFilterChange={setFilters}
      />
      <ReportExporter
        income={filteredData.current.income}
        expenses={filteredData.current.expenses}
      />
      <p><b>Current Range:</b> {dateRange.start.toLocaleDateString()} - {dateRange.end.toLocaleDateString()}</p>
      <p><b>Comparison Mode:</b> {comparison}</p>
      
      <div style={{ marginTop: '20px' }}>
        <h3>Data Overview</h3>
        <p>Total Income Records: {filteredData.current.income.length} (of {current.income.length})</p>
        <p>Total Expense Records: {filteredData.current.expenses.length} (of {current.expenses.length})</p>
        {comparison !== 'none' && (
          <>
            <p>Previous Income Records: {filteredData.previous.income.length} (of {previous.income.length})</p>
            <p>Previous Expense Records: {filteredData.previous.expenses.length} (of {previous.expenses.length})</p>
          </>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px', marginTop: '30px' }}>
        <div style={{ maxWidth: '800px' }}>
          <TrendChart
            currentData={filteredData.current}
            previousData={filteredData.previous}
            dateRange={dateRange}
            comparison={comparison}
          />
        </div>
        <div style={{ maxWidth: '400px' }}>
          <CategoryBreakdown
            currentExpenses={filteredData.current.expenses}
            previousExpenses={filteredData.previous.expenses}
            comparison={comparison}
          />
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;