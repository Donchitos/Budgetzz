import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import type { DocumentData, QuerySnapshot } from 'firebase/firestore';

ChartJS.register(ArcElement, Tooltip, Legend);

interface ExpenseChartProps {
  expensesSnapshot: QuerySnapshot<DocumentData, DocumentData> | undefined;
}

function ExpenseChart({ expensesSnapshot }: ExpenseChartProps) {
  const processChartData = () => {
    const categories: { [key: string]: number } = {};

    expensesSnapshot?.docs.forEach(doc => {
      const category = doc.data().category || 'Uncategorized';
      const amount = doc.data().amount;
      if (categories[category]) {
        categories[category] += amount;
      } else {
        categories[category] = amount;
      }
    });

    const data = {
      labels: Object.keys(categories),
      datasets: [
        {
          label: 'Expenses by Category',
          data: Object.values(categories),
          backgroundColor: [
            'rgba(255, 99, 132, 0.7)',
            'rgba(54, 162, 235, 0.7)',
            'rgba(255, 206, 86, 0.7)',
            'rgba(75, 192, 192, 0.7)',
            'rgba(153, 102, 255, 0.7)',
            'rgba(255, 159, 64, 0.7)',
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)',
          ],
          borderWidth: 1,
        },
      ],
    };
    return data;
  };

  return (
    <div style={{ maxWidth: '400px', margin: 'auto' }}>
      <h3>Spending Breakdown</h3>
      <Pie data={processChartData()} />
    </div>
  );
}

export default ExpenseChart;