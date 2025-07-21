// src/features/reports/TrendChart.tsx
import React, { useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import type { ChartDataset } from 'chart.js';
import { eachMonthOfInterval, format, startOfMonth, subYears } from 'date-fns';
import type { Transaction, DateRange, ComparisonMode } from '../../types';
import { Timestamp } from 'firebase/firestore';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface AnalyticsData {
  income: Transaction[];
  expenses: Transaction[];
}

interface TrendChartProps {
  currentData: AnalyticsData;
  previousData: AnalyticsData;
  dateRange: DateRange;
  comparison: ComparisonMode;
}

const TrendChart: React.FC<TrendChartProps> = ({ currentData, previousData, dateRange, comparison }) => {
  const chartData = useMemo(() => {
    const months = eachMonthOfInterval({
      start: dateRange.start,
      end: dateRange.end,
    });

    const labels = months.map(month => format(month, 'MMM yyyy'));

    const getNormalizedDate = (date: Date | Timestamp): Date => {
      if (date instanceof Timestamp) {
        return date.toDate();
      }
      return date;
    };

    const aggregateData = (transactions: Transaction[], range: DateRange) => {
      const intervalMonths = eachMonthOfInterval({ start: range.start, end: range.end });
      const monthlyTotals = new Array(labels.length).fill(0);

      transactions.forEach(t => {
        const transactionDate = getNormalizedDate(t.createdAt);
        const monthKey = format(startOfMonth(transactionDate), 'MMM yyyy');
        
        let labelIndex = -1;
        if (comparison === 'yoy') {
          const originalDateKey = format(startOfMonth(subYears(transactionDate, -1)), 'MMM yyyy');
          labelIndex = labels.indexOf(originalDateKey);
        } else {
          labelIndex = labels.indexOf(monthKey);
        }

        if (labelIndex !== -1) {
          monthlyTotals[labelIndex] += t.amount;
        }
      });
      return monthlyTotals;
    };

    const datasets: ChartDataset<'line', number[]>[] = [
      {
        label: 'Current Income',
        data: aggregateData(currentData.income, dateRange),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
      },
      {
        label: 'Current Expenses',
        data: aggregateData(currentData.expenses, dateRange),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
    ];

    if (comparison !== 'none') {
      datasets.push({
        label: 'Previous Income',
        data: aggregateData(previousData.income, dateRange),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderDash: [5, 5],
      });
      datasets.push({
        label: 'Previous Expenses',
        data: aggregateData(previousData.expenses, dateRange),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderDash: [5, 5],
      });
    }

    return {
      labels,
      datasets,
    };
  }, [currentData, previousData, dateRange, comparison]);

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Income vs. Expense Trends',
      },
    },
  };

  return <Line options={options} data={chartData} />;
};

export default TrendChart;