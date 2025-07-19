import React from "react";
import TransactionForm from "./TransactionForm";
import Card from "../../components/Card";
import { addTransaction, deleteTransaction } from "../../services/api";
import type { Transaction } from "../../types";
import TransactionList from "../../components/TransactionList";

interface ExpenseTrackerProps {
  expenses: Transaction[];
}

function ExpenseTracker({ expenses }: ExpenseTrackerProps) {
  const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);

  const handleAddExpense = async (
    description: string,
    amount: number,
    category?: string
  ) => {
    try {
      await addTransaction("expenses", description, amount, category);
    } catch (err) {
      console.error("Error adding expense: ", err);
      alert("Error adding expense. Please try again.");
    }
  };

  const handleDeleteExpense = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this expense?")) {
      try {
        await deleteTransaction("expenses", id);
      } catch (err) {
        console.error("Error deleting expense: ", err);
        alert("Error deleting expense. Please try again.");
      }
    }
  };

  return (
    <Card title="Expense Tracker">
      <TransactionForm
        onAddTransaction={handleAddExpense}
        transactionType="Expense"
      />
      <hr />
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <h2 style={{ color: "#dc3545" }}>
          Total Expenses: ${totalExpenses.toFixed(2)}
        </h2>
        <div style={{ fontSize: "0.9em", color: "#666" }}>
          {expenses.length} transaction{expenses.length !== 1 ? "s" : ""}
        </div>
      </div>
      <TransactionList
        transactions={expenses}
        onDelete={handleDeleteExpense}
        title="Your Expenses"
        color="#dc3545"
      />
    </Card>
  );
}

export default ExpenseTracker;