import React from "react";
import TransactionForm from "./TransactionForm";
import Card from "../../components/Card";
import type { Transaction } from "../../types";
import TransactionList from "../../components/TransactionList";
import { useTransactions } from "../../hooks/useTransactions";
import "./TransactionTracker.css";

interface TransactionTrackerProps {
  transactions: Transaction[];
  transactionType: "Income" | "Expense";
  title: string;
}

function TransactionTracker({
  transactions,
  transactionType,
  title,
}: TransactionTrackerProps) {
  const { addTransaction, deleteTransaction } = useTransactions(new Date());

  const total = transactions.reduce((sum, item) => sum + item.amount, 0);

  const handleAddTransaction = async (
    description: string,
    amount: number,
    category?: string
  ) => {
    try {
      await addTransaction(
        transactionType.toLowerCase() as "income" | "expenses",
        description,
        amount,
        category
      );
    } catch (err) {
      console.error(`Error adding ${transactionType}: `, err);
      alert(`Error adding ${transactionType}. Please try again.`);
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    if (
      window.confirm(
        `Are you sure you want to delete this ${transactionType.toLowerCase()}?`
      )
    ) {
      try {
        await deleteTransaction(id);
      } catch (err) {
        console.error(`Error deleting ${transactionType}: `, err);
        alert(`Error deleting ${transactionType}. Please try again.`);
      }
    }
  };

  return (
    <Card title={title}>
      <TransactionForm
        onAddTransaction={handleAddTransaction}
        transactionType={transactionType}
      />
      <hr />
      <div className="tracker-summary">
        <h2 className={transactionType.toLowerCase()}>
          Total {transactionType}: ${total.toFixed(2)}
        </h2>
        <div className="count">
          {transactions.length} transaction
          {transactions.length !== 1 ? "s" : ""}
        </div>
      </div>
      <TransactionList
        transactions={transactions}
        onDelete={handleDeleteTransaction}
        title={`Your ${transactionType}`}
      />
    </Card>
  );
}

export default TransactionTracker;