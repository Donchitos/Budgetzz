import React from "react";
import type { Transaction } from "../types";
import { formatTransactionDate } from "../utils/dateUtils";
import Button from "./Button";
import "../features/transactions/Transaction.css";

interface TransactionListProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
  title: string;
  color: string;
}

const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  onDelete,
  title,
  color,
}) => {
  return (
    <div>
      <h3>{title}</h3>
      {transactions.length === 0 ? (
        <p
          style={{
            color: "#666",
            fontStyle: "italic",
            textAlign: "center",
            padding: "20px",
          }}
        >
          No transactions recorded.
        </p>
      ) : (
        <ul className="transaction-list">
          {transactions
            .sort((a, b) => {
              const dateA =
                a.createdAt instanceof Date
                  ? a.createdAt
                  : a.createdAt.toDate();
              const dateB =
                b.createdAt instanceof Date
                  ? b.createdAt
                  : b.createdAt.toDate();
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
                  <span className="amount" style={{ color }}>
                    ${transaction.amount.toFixed(2)}
                  </span>
                  <Button
                    onClick={() => onDelete(transaction.id)}
                    style={{
                      backgroundColor: "#dc3545",
                      fontSize: "0.8em",
                      padding: "6px 12px",
                    }}
                  >
                    Delete
                  </Button>
                </div>
              </li>
            ))}
        </ul>
      )}
    </div>
  );
};

export default TransactionList;