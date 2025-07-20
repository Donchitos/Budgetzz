// Create this file at: src/components/PeriodSelector.tsx
import React from 'react';
import Button from './Button';

interface PeriodSelectorProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

const PeriodSelector: React.FC<PeriodSelectorProps> = ({ selectedDate, onDateChange }) => {
  const currentMonth = selectedDate.getMonth();
  const currentYear = selectedDate.getFullYear();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const goToPreviousMonth = () => {
    const newDate = new Date(currentYear, currentMonth - 1, 1);
    onDateChange(newDate);
  };

  const goToNextMonth = () => {
    const newDate = new Date(currentYear, currentMonth + 1, 1);
    onDateChange(newDate);
  };

  const goToCurrentMonth = () => {
    const now = new Date();
    const newDate = new Date(now.getFullYear(), now.getMonth(), 1);
    onDateChange(newDate);
  };

  const isCurrentMonth = () => {
    const now = new Date();
    return currentMonth === now.getMonth() && currentYear === now.getFullYear();
  };

  return (
    <div className="flex items-center gap-4 mb-5 p-4 bg-gray-50 rounded-lg border border-gray-200">
      <Button onClick={goToPreviousMonth}>
        ← Previous
      </Button>
      
      <div className="flex-1 text-center text-lg font-bold text-gray-800">
        {monthNames[currentMonth]} {currentYear}
      </div>
      
      <Button onClick={goToNextMonth}>
        Next →
      </Button>
      
      {!isCurrentMonth() && (
        <Button
          onClick={goToCurrentMonth}
          className="bg-green-500 hover:bg-green-600 text-white ml-2"
        >
          Current Month
        </Button>
      )}
    </div>
  );
};

export default PeriodSelector;