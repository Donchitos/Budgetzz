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
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: '15px', 
      marginBottom: '20px',
      padding: '15px',
      backgroundColor: '#f8f9fa',
      borderRadius: '8px',
      border: '1px solid #e9ecef'
    }}>
      <Button onClick={goToPreviousMonth}>
        ← Previous
      </Button>
      
      <div style={{ 
        flex: 1, 
        textAlign: 'center', 
        fontSize: '1.2em', 
        fontWeight: 'bold',
        color: '#2c3e50'
      }}>
        {monthNames[currentMonth]} {currentYear}
      </div>
      
      <Button onClick={goToNextMonth}>
        Next →
      </Button>
      
      {!isCurrentMonth() && (
        <Button 
          onClick={goToCurrentMonth}
          style={{ 
            backgroundColor: '#28a745',
            marginLeft: '10px'
          }}
        >
          Current Month
        </Button>
      )}
    </div>
  );
};

export default PeriodSelector;