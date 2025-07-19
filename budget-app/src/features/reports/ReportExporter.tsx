// src/features/reports/ReportExporter.tsx
import React from 'react';
import type { Transaction } from '../../types';
import { format } from 'date-fns';

interface ReportExporterProps {
  income: Transaction[];
  expenses: Transaction[];
  filename?: string;
}

const ReportExporter: React.FC<ReportExporterProps> = ({ income, expenses, filename = 'budget_report.csv' }) => {
  
  const convertToCSV = (incomeData: Transaction[], expensesData: Transaction[]): string => {
    const headers = ['Date', 'Description', 'Category', 'Amount', 'Type'];
    
    const allTransactions = [
      ...incomeData.map(t => ({ ...t, type: 'Income' })),
      ...expensesData.map(t => ({ ...t, type: 'Expense' }))
    ];

    // Sort by date, most recent first
    allTransactions.sort((a, b) => {
      const dateA = a.createdAt instanceof Date ? a.createdAt : a.createdAt.toDate();
      const dateB = b.createdAt instanceof Date ? b.createdAt : b.createdAt.toDate();
      return dateB.getTime() - dateA.getTime();
    });

    const rows = allTransactions.map(t => {
      const date = t.createdAt instanceof Date ? t.createdAt : t.createdAt.toDate();
      return [
        format(date, 'yyyy-MM-dd'),
        `"${t.description.replace(/"/g, '""')}"`, // Escape double quotes
        t.category || '',
        t.amount,
        (t as any).type
      ].join(',');
    });

    return [headers.join(','), ...rows].join('\n');
  };

  const handleExport = () => {
    const csvData = convertToCSV(income, expenses);
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    
    const link = document.createElement('a');
    if (link.href) {
      URL.revokeObjectURL(link.href);
    }
    
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <button onClick={handleExport} style={{ marginTop: '20px', padding: '10px 15px' }}>
      Download CSV
    </button>
  );
};

export default ReportExporter;