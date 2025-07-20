import React from "react";
import type { Transaction } from "../../types";
import TransactionTracker from "./TransactionTracker";

interface IncomeTrackerProps {
  income: Transaction[];
}

function IncomeTracker({ income }: IncomeTrackerProps) {
  return (
    <TransactionTracker
      transactions={income}
      transactionType="Income"
      title="Income Tracker"
    />
  );
}

export default IncomeTracker;