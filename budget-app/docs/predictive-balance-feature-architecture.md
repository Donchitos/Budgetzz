# Predictive Balance Feature Architecture

## 1. Overview

This document outlines the architecture for the "Future Balance Projection" widget. This feature will provide users with a 30-90 day forecast of their account balance based on their recurring transactions. Phase 1 focuses on creating the foundational component and frontend logic for this projection.

## 2. Component Design

### New Component: `FutureBalanceProjection.tsx`

This component will be responsible for rendering the balance projection chart.

**Location:** `src/features/dashboard/FutureBalanceProjection.tsx`

**Props:**

```typescript
interface FutureBalanceProjectionProps {
  currentBalance: number;
  recurringTransactions: RecurringTransaction[];
  daysToProject?: number; // Default to 90
}
```

**State:**

*   `projectionData`: An array of `(date, projected_balance)` points.
*   `chartOptions`: Configuration options for the `chart.js` line chart.
*   `loading`: A boolean to indicate when the projection is being calculated.
*   `error`: Any error that occurs during projection calculation.

**Example Usage in `Dashboard.tsx`:**

```typescript
import FutureBalanceProjection from './FutureBalanceProjection';
import { useTransactions } from '../../hooks/useTransactions';
import useFirestoreCollection from '../../hooks/useFirestoreCollection';

// ... inside the Dashboard component

const { totalIncome, totalExpenses } = useTransactions(new Date()); // This needs to be adapted to get the *total* balance
const { snapshot: recurringSnapshot } = useFirestoreCollection('recurring-transactions');

const allRecurring = recurringSnapshot?.docs.map(doc => ({
  id: doc.id,
  ...doc.data()
} as RecurringTransaction)) || [];

// This is a simplification. A new hook `useAccountBalance` will be created.
const currentBalance = totalIncome - totalExpenses;

return (
  // ... other dashboard components
  <FutureBalanceProjection
    currentBalance={currentBalance}
    recurringTransactions={allRecurring}
    daysToProject={90}
  />
);
```

## 3. Data Flow

The data will flow from Firestore through our custom hooks to the `FutureBalanceProjection.tsx` component.

```mermaid
graph TD
    A[Firestore Collections: income, expenses, recurring-transactions] --> B[Custom Hooks];
    B --> C{Dashboard.tsx};
    C --> D[FutureBalanceProjection.tsx];
    D --> E[Chart.js];

    subgraph Custom Hooks
        direction LR
        B1[useAccountBalance.ts <br> (New)]
        B2[useFirestoreCollection.ts <br> (Existing)]
    end

    B1 --> C;
    B2 --> C;
```

**Explanation:**

1.  **`useAccountBalance.ts` (New Hook):** A new hook will be created to calculate the user's current account balance. It will fetch all documents from the `income` and `expenses` collections and calculate the total. This is more efficient than fetching all transactions every time.
2.  **`useFirestoreCollection.ts` (Existing Hook):** This hook will be used to fetch the `recurring-transactions` as it is already doing in `UpcomingTransactions.tsx`.
3.  **`Dashboard.tsx`:** This component will orchestrate fetching the `currentBalance` and `recurringTransactions` and pass them as props to the `FutureBalanceProjection.tsx` component.
4.  **`FutureBalanceProjection.tsx`:** This component will receive the data and use the projection logic to generate the data points for the chart.
5.  **`Chart.js`:** The generated data points will be rendered as a line chart.

## 4. Projection Logic

The core of this feature is the projection logic. This logic will be encapsulated in a new utility function.

**Location:** `src/utils/projectionUtils.ts`

**Function Signature:**

```typescript
interface ProjectionPoint {
  date: Date;
  balance: number;
}

function calculateBalanceProjection(
  currentBalance: number,
  recurringTransactions: RecurringTransaction[],
  daysToProject: number
): ProjectionPoint[] {
  // ... implementation
}
```

**Algorithm:**

1.  Create an array of dates for the next `daysToProject` days.
2.  Initialize a `projectedBalance` variable with the `currentBalance`.
3.  Create a `balanceData` array, starting with `{ date: new Date(), balance: currentBalance }`.
4.  Iterate through each day in the projection period.
5.  For each day, iterate through the `recurringTransactions`.
6.  Use the existing `getUpcomingRecurringTransactions` logic (or a variation of it) from `recurringUtils.ts` to determine if a recurring transaction falls on the current day of the iteration.
7.  If a transaction occurs on that day, add or subtract its amount from the `projectedBalance`.
8.  Push the new `{ date, balance: projectedBalance }` to the `balanceData` array.
9.  Return the `balanceData` array.

## 5. Backend vs. Frontend Logic

For Phase 1, the projection logic will be implemented on the **frontend** within a new `useBalanceProjection` hook.

**`useBalanceProjection.ts`:**

```typescript
import { useState, useEffect } from 'react';
import { calculateBalanceProjection } from '../utils/projectionUtils';
import { RecurringTransaction } from '../types';

export const useBalanceProjection = (
  currentBalance: number,
  recurringTransactions: RecurringTransaction[],
  daysToProject: number
) => {
  const [projection, setProjection] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentBalance !== undefined && recurringTransactions.length > 0) {
      const data = calculateBalanceProjection(currentBalance, recurringTransactions, daysToProject);
      setProjection(data);
      setLoading(false);
    }
  }, [currentBalance, recurringTransactions, daysToProject]);

  return { projection, loading };
};
```

**Rationale:**

*   **Simplicity:** A frontend hook is simpler and faster to implement for Phase 1.
*   **Real-time Feedback:** The user can see the projection update in real-time as they modify their recurring transactions.
*   **Scalability:** For more complex scenarios in the future (e.g., involving machine learning models for non-recurring transaction prediction), the logic can be moved to a Firebase Cloud Function.

## 6. Charting Library

We will use the existing `chart.js` and `react-chartjs-2` libraries to render the balance projection as a line chart. This ensures consistency with the rest of the application and avoids introducing a new dependency.