import { useState } from "react";

interface UseTransactionFormProps {
  onAddTransaction: (
    description: string,
    amount: number,
    category?: string
  ) => void;
  transactionType: "Income" | "Expense";
}

export const useTransactionForm = ({
  onAddTransaction,
  transactionType,
}: UseTransactionFormProps) => {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Food");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert("Please enter a valid amount greater than 0.");
      return;
    }
    onAddTransaction(
      description,
      parsedAmount,
      transactionType === "Expense" ? category : undefined
    );
    setDescription("");
    setAmount("");
  };

  return {
    description,
    setDescription,
    amount,
    setAmount,
    category,
    setCategory,
    handleSubmit,
  };
};