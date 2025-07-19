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
      await addTransaction("income", description, amount);
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
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <h2 style={{ color: "#28a745" }}>
          Total Income: ${totalIncome.toFixed(2)}
        </h2>
        <div style={{ fontSize: "0.9em", color: "#666" }}>
          {income.length} source{income.length !== 1 ? "s" : ""}
        </div>
      </div>
      <TransactionList
        transactions={income}
        onDelete={handleDeleteIncome}
        title="Your Income Sources"
        color="#28a745"
      />
    </Card>
  );
}

export default IncomeTracker;