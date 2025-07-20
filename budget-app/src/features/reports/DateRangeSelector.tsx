// src/features/reports/DateRangeSelector.tsx
import React from 'react';
import { subMonths, startOfYear, endOfDay, startOfDay } from 'date-fns';
import type { DateRange, ComparisonMode } from '../../types';
import Button from '../../components/Button';

interface DateRangeSelectorProps {
  onDateRangeChange: (dateRange: DateRange) => void;
  onComparisonChange: (mode: ComparisonMode) => void;
  currentComparison: ComparisonMode;
}

const DateRangeSelector: React.FC<DateRangeSelectorProps> = ({
  onDateRangeChange,
  onComparisonChange,
  currentComparison,
}) => {
  const today = endOfDay(new Date());

  const setRange = (start: Date, end: Date = today) => {
    onDateRangeChange({ start: startOfDay(start), end });
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <strong>Date Range:</strong>
        <Button onClick={() => setRange(subMonths(today, 6))}>Last 6 Months</Button>
        <Button onClick={() => setRange(startOfYear(today))}>Year to Date</Button>
        <Button onClick={() => setRange(subMonths(today, 12))}>Last 12 Months</Button>
        <span className="text-gray-500"><i>(Custom date range coming soon)</i></span>
      </div>
      <div className="flex items-center gap-2 mb-4">
        <strong>Compare:</strong>
        <Button onClick={() => onComparisonChange('none')} disabled={currentComparison === 'none'}>None</Button>
        <Button onClick={() => onComparisonChange('mom')} disabled={currentComparison === 'mom'}>Month-over-Month</Button>
        <Button onClick={() => onComparisonChange('yoy')} disabled={currentComparison === 'yoy'}>Year-over-Year</Button>
      </div>
    </div>
  );
};

export default DateRangeSelector;