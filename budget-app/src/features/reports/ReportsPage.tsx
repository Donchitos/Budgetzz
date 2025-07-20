import React from 'react';
import './Reports.css';
import DateRangeSelector from './DateRangeSelector';
import TrendChart from './TrendChart';
import CategoryBreakdown from './CategoryBreakdown';
import AdvancedFilterControls from './AdvancedFilterControls';
import ReportExporter from './ReportExporter';
import Skeleton from '../../components/Skeleton';
import { useReportData } from './useReportData';

const ReportsPage: React.FC = () => {
  const {
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
    originalData,
  } = useReportData();

  if (loading) {
    return (
      <div>
        <h2>Advanced Reports</h2>
        <Skeleton className="h-12 w-full mb-4" />
        <Skeleton className="h-12 w-full mb-4" />
        <div className="grid grid-cols-[2fr_1fr] gap-8 mt-8">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }
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
      
      <div className="mt-5">
        <h3>Data Overview</h3>
        <p>Total Income Records: {filteredData.current.income.length} (of {originalData.current.income.length})</p>
        <p>Total Expense Records: {filteredData.current.expenses.length} (of {originalData.current.expenses.length})</p>
        {comparison !== 'none' && (
          <>
            <p>Previous Income Records: {filteredData.previous.income.length} (of {originalData.previous.income.length})</p>
            <p>Previous Expense Records: {filteredData.previous.expenses.length} (of {originalData.previous.expenses.length})</p>
          </>
        )}
      </div>

      <div className="grid grid-cols-[2fr_1fr] gap-8 mt-8">
        <div className="max-w-3xl">
          <TrendChart
            currentData={filteredData.current}
            previousData={filteredData.previous}
            dateRange={dateRange}
            comparison={comparison}
          />
        </div>
        <div className="max-w-md">
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