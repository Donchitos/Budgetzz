import React, { useState } from "react";
import Card from "../../components/Card";
import Input from "../../components/Input";
import Button from "../../components/Button";
import { setBudget, deleteBudget } from "../../services/api";
import type { Budget } from "../../types";
import { formatDateRange } from "../../utils/dateUtils";
import "./Budget.css";

const categories = [
  "Food",
  "Transport",
  "Housing",
  "Utilities",
  "Entertainment",
  "Other",
];

interface BudgetManagerProps {
  budgets: Budget[];
  selectedPeriod: Date;
}

function BudgetManager({ budgets, selectedPeriod }: BudgetManagerProps) {
  const [category, setCategory] = useState("Food");
  const [budgetAmount, setBudgetAmount] = useState("");

  const handleSetBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(budgetAmount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert("Please enter a valid budget amount.");
      return;
    }

    try {
      await setBudget(category, parsedAmount, selectedPeriod);
      setBudgetAmount("");
      alert(`Budget set for ${category}`);
    } catch (err) {
      console.error("Error setting budget: ", err);
      alert("Error setting budget. Please try again.");
    }
  };

  const handleDeleteBudget = async (budgetId: string, category: string) => {
    if (window.confirm(`Are you sure you want to delete the ${category} budget?`)) {
      try {
        await deleteBudget(budgetId);
      } catch (err) {
        console.error("Error deleting budget: ", err);
        alert("Error deleting budget. Please try again.");
      }
    }
  };

  const existingBudget = budgets.find((b) => b.category === category);

  return (
    <Card title={`Set Budgets - ${formatDateRange({ start: selectedPeriod, end: selectedPeriod })}`}>
      <form onSubmit={handleSetBudget} className="budget-manager-form">
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        <Input
          type="number"
          value={budgetAmount}
          onChange={(e) => setBudgetAmount(e.target.value)}
          placeholder="Budget Amount"
          required
          step="0.01"
          min="0"
        />
        <Button type="submit">
          {existingBudget ? "Update Budget" : "Set Budget"}
        </Button>
      </form>

      {existingBudget && (
        <div
          style={{
            marginTop: "10px",
            padding: "10px",
            backgroundColor: "#e3f2fd",
            borderRadius: "4px",
            fontSize: "0.9em",
          }}
        >
          Current {category} budget:{" "}
          <strong>${existingBudget.budgetAmount.toFixed(2)}</strong>
        </div>
      )}

      <hr />

      <h3>Current Month's Budgets</h3>
      {budgets.length === 0 ? (
        <p style={{ color: "#666", fontStyle: "italic" }}>
          No budgets set for this month.
        </p>
      ) : (
        <ul className="budget-list">
          {budgets.map((budget) => (
            <li key={budget.id} className="budget-item">
              <div>
                <span className="category">{budget.category}</span>
                <span className="amount">
                  ${budget.budgetAmount.toFixed(2)}
                </span>
              </div>
              <Button
                onClick={() => handleDeleteBudget(budget.id, budget.category)}
                style={{
                  backgroundColor: "#dc3545",
                  fontSize: "0.8em",
                  padding: "5px 10px",
                }}
              >
                Delete
              </Button>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

export default BudgetManager;