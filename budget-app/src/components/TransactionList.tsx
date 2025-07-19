import React from "react";
import type { Transaction } from "../types";
import { formatTransactionDate } from "../utils/dateUtils";
import Button from "./Button";
import Card from "./Card";
import "../features/transactions/Transaction.css";

interface TransactionListProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
  title: string;
}

const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  onDelete,
  title,
}) => {
  return (
    <Card title={title}>
      {transactions.length === 0 ? (
        <p style={{ textAlign: "center", color: "var(--neutral-gray-dark)" }}>
          No transactions recorded.
        </p>
      ) : (
        <ul className="transaction-list">
          {transactions
            .map((transaction) => (
              <li key={transaction.id} className="transaction-item">
                <div className="description">
                  <div className="main">{transaction.description}</div>
                  <div className="date">
                    {formatTransactionDate(transaction.createdAt)}
                  </div>
                </div>
                <div className="details">
                  <span className={`amount ${transaction.type === 'income' ? 'income' : 'expense'}`}>
                    {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                  </span>
                  <Button
                    onClick={() => onDelete(transaction.id)}
                    variant="destructive"
                    style={{ fontSize: "0.8em", padding: "6px 12px" }}
                  >
                    Delete
                  </Button>
                </div>
              </li>
            ))}
        </ul>
      )}
    </Card>
  );
};

export default TransactionList;