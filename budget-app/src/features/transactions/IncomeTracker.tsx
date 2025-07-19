import React from "react";
import TransactionForm from "./TransactionForm";
import Card from "../../components/Card";
import { addTransaction, deleteTransaction } from "../../services/api";
import type { Transaction } from "../../types";
import TransactionList from "../../components/TransactionList";

interface IncomeTrackerProps {
  income: Transaction[];
}

function IncomeTracker({ income }: IncomeTrackerProps) {
  const totalIncome = income.reduce((sum, item) => sum + item.amount, 0);

  const handleAddIncome = async (description: string, amount: number) => {
    try {
      await addTransaction("income", description, amount, undefined, undefined, "income");
    } catch (err) {
      console.error("Error adding income: ", err);
      alert("Error adding income. Please try again.");
    }
  };

  const handleDeleteIncome = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this income entry?")) {
      try {
        await deleteTransaction("income", id);
      } catch (err) {
        console.error("Error deleting income: ", err);
        alert("Error deleting income. Please try again.");
      }
    }
  };

  return (
    <Card title="Income Tracker">
      <TransactionForm onAddTransaction={handleAddIncome} transactionType="Income" />
      <hr />
      <div className="tracker-summary">
        <h2 className="income">
          Total Income: ${totalIncome.toFixed(2)}
        </h2>
        <div className="count">
          {income.length} source{income.length !== 1 ? "s" : ""}
        </div>
      </div>
      <TransactionList
        transactions={income}
        onDelete={handleDeleteIncome}
        title="Your Income Sources"
      />
    </Card>
  );
}

export default IncomeTracker;