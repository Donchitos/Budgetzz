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
  type: 'income' | 'expense';
}

const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  onDelete,
  title,
  type,
}) => {
  const amountClass = type === 'income' ? 'income' : 'expense';

  return (
    <Card title={title}>
      {transactions.length === 0 ? (
        <p style={{ textAlign: "center", color: "var(--neutral-gray-dark)" }}>
          No transactions recorded.
        </p>
      ) : (
        <ul className="transaction-list">
          {transactions
            .sort((a, b) => {
              const dateA = a.createdAt instanceof Date ? a.createdAt : a.createdAt.toDate();
              const dateB = b.createdAt instanceof Date ? b.createdAt : b.createdAt.toDate();
              return dateB.getTime() - dateA.getTime();
            })
            .map((transaction) => (
              <li key={transaction.id} className="transaction-item">
                <div className="description">
                  <div className="main">{transaction.description}</div>
                  <div className="date">
                    {formatTransactionDate(transaction.createdAt)}
                  </div>
                </div>
                <div className="details">
                  <span className={`amount ${amountClass}`}>
                    ${transaction.amount.toFixed(2)}
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