// src/components/BudgetComparison.tsx

import type { DocumentData, QuerySnapshot } from 'firebase/firestore';

interface BudgetComparisonProps {
  budgetsSnapshot: QuerySnapshot<DocumentData, DocumentData> | undefined;
  expensesSnapshot: QuerySnapshot<DocumentData, DocumentData> | undefined;
}

function BudgetComparison({ budgetsSnapshot, expensesSnapshot }: BudgetComparisonProps) {
  // 1. Process data into simple objects
  const budgets = budgetsSnapshot?.docs.reduce((acc, doc) => {
    acc[doc.data().category] = doc.data().budgetAmount;
    return acc;
  }, {} as { [key: string]: number });

  const spending = expensesSnapshot?.docs.reduce((acc, doc) => {
    const category = doc.data().category || 'Uncategorized';
    acc[category] = (acc[category] || 0) + doc.data().amount;
    return acc;
  }, {} as { [key: string]: number });

  if (!budgets || Object.keys(budgets).length === 0) {
    return <h4>You haven't set any budgets yet.</h4>;
  }

  return (
    <div className="tracker-container">
      <h3>Budget vs. Actual Spending</h3>
      <ul>
        {Object.entries(budgets).map(([category, budgetAmount]) => {
          const spentAmount = spending[category] || 0;
          const remaining = budgetAmount - spentAmount;
          const percentage = (spentAmount / budgetAmount) * 100;

          return (
            <li key={category}>
              <div>
                <strong>{category}</strong>
                <div style={{ fontSize: '0.9em', color: '#555' }}>
                  Spent: ${spentAmount.toFixed(2)} of ${budgetAmount.toFixed(2)}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <strong style={{ color: remaining >= 0 ? 'green' : 'red' }}>
                  {remaining >= 0 ? `$${remaining.toFixed(2)} Left` : `-$${Math.abs(remaining).toFixed(2)} Over`}
                </strong>
                {/* Optional: Progress Bar */}
                <div style={{
                  width: '100px',
                  height: '10px',
                  backgroundColor: '#eee',
                  borderRadius: '5px',
                  marginTop: '5px'
                }}>
                  <div style={{
                    width: `${Math.min(percentage, 100)}%`,
                    height: '100%',
                    backgroundColor: percentage > 100 ? '#e74c3c' : '#2ecc71',
                    borderRadius: '5px'
                  }}></div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default BudgetComparison;