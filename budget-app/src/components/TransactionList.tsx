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
        <p className="text-center text-gray-500">
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
                    className="text-xs py-1 px-2 btn-delete"
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