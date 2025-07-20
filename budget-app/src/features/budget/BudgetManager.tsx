import { useState } from "react";
import Card from "../../components/Card";
import Button from "../../components/Button";
import type { Budget } from "../../types";
import { formatDateRange } from "../../utils/dateUtils";
import BudgetRecommender from "./BudgetRecommender";
import BudgetForm from "./BudgetForm";
import BudgetList from "./BudgetList";
import "./Budget.css";

/**
 * @interface BudgetManagerProps
 * @description Props for the BudgetManager component.
 * @property {Budget[]} budgets - An array of budget objects.
 * @property {Date} selectedPeriod - The currently selected time period.
 */
interface BudgetManagerProps {
  budgets: Budget[];
  selectedPeriod: Date;
}

/**
 * @function BudgetManager
 * @description A component for managing budgets, including setting, viewing, and getting smart suggestions.
 * @param {BudgetManagerProps} props - The props for the component.
 * @returns {React.ReactElement} The rendered component.
 */
function BudgetManager({ budgets, selectedPeriod }: BudgetManagerProps) {
  const [showRecommender, setShowRecommender] = useState(false);

  return (
    <Card title={`Set Budgets - ${formatDateRange({ start: selectedPeriod, end: selectedPeriod })}`}>
      {!showRecommender ? (
        <>
          <BudgetForm selectedPeriod={selectedPeriod} budgets={budgets} />

          <hr />

          <div className="budget-list-header">
            <h3>Current Month's Budgets</h3>
            <Button onClick={() => setShowRecommender(true)} className="bg-green-500 hover:bg-green-600 text-white">
              Get Smart Suggestions
            </Button>
          </div>

          {budgets.length === 0 ? (
            <p className="no-budgets-message">
              No budgets set for this month.
            </p>
          ) : (
            <BudgetList budgets={budgets} selectedPeriod={selectedPeriod} />
          )}
        </>
      ) : (
        <BudgetRecommender onBudgetsApplied={() => setShowRecommender(false)} />
      )}
    </Card>
  );
}

export default BudgetManager;