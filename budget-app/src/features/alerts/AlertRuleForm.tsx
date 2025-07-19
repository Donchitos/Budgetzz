import React, { useState, useEffect } from 'react';
import { addAlertRule, updateAlertRule } from '../../services/api';
import type { AlertRule, AlertType, BillDueTiming } from '../../types/alerts';
import useFirestoreCollection from '../../hooks/useFirestoreCollection';
import type { Budget, RecurringTransaction } from '../../types';
import type { FinancialGoal } from '../../types/goals';

interface AlertRuleFormProps {
  rule?: AlertRule;
  onSave: () => void;
}

const AlertRuleForm: React.FC<AlertRuleFormProps> = ({ rule, onSave }) => {
  const [alertType, setAlertType] = useState<AlertType>(rule?.alertType || 'BUDGET_THRESHOLD');
  const [isEnabled, setIsEnabled] = useState(rule?.isEnabled ?? true);

  // Budget Threshold state
  const [budgetId, setBudgetId] = useState(rule?.budgetId || '');
  const [threshold, setThreshold] = useState(rule?.threshold || 80);

  // Bill Due state
  const [recurringTransactionId, setRecurringTransactionId] = useState(rule?.recurringTransactionId || '');
  const [timing, setTiming] = useState<BillDueTiming>(rule?.timing || '1_DAY_BEFORE');

  // Goal Progress state
  const [goalId, setGoalId] = useState(rule?.goalId || '');

  const { snapshot: budgetSnapshot } = useFirestoreCollection('budgets');
  const budgets: Budget[] = budgetSnapshot ? budgetSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Budget)) : [];

  const { snapshot: recurringSnapshot } = useFirestoreCollection('recurring-transactions');
  const recurringTransactions: RecurringTransaction[] = recurringSnapshot ? recurringSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as RecurringTransaction)) : [];

  const { snapshot: goalsSnapshot } = useFirestoreCollection('financialGoals');
  const goals: FinancialGoal[] = goalsSnapshot ? goalsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FinancialGoal)) : [];


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const commonData = { alertType, isEnabled };
    let ruleData: Omit<AlertRule, 'id' | 'userId' | 'createdAt' | 'updatedAt'>;

    switch (alertType) {
      case 'BUDGET_THRESHOLD':
        ruleData = { ...commonData, budgetId, threshold };
        break;
      case 'BILL_DUE':
        ruleData = { ...commonData, recurringTransactionId, timing };
        break;
      case 'GOAL_PROGRESS':
        ruleData = { ...commonData, goalId };
        break;
      default:
        return;
    }

    if (rule) {
      await updateAlertRule(rule.id, ruleData);
    } else {
      await addAlertRule(ruleData);
    }
    onSave();
  };

  return (
    <form onSubmit={handleSubmit} className="card">
      <h2>{rule ? 'Edit' : 'Create'} Alert Rule</h2>
      
      <div className="form-group">
        <label>Alert Type</label>
        <select value={alertType} onChange={(e) => setAlertType(e.target.value as AlertType)}>
          <option value="BUDGET_THRESHOLD">Budget Threshold</option>
          <option value="BILL_DUE">Bill Due</option>
          <option value="GOAL_PROGRESS">Goal Progress</option>
          {/* <option value="UNUSUAL_SPENDING">Unusual Spending</option> */}
        </select>
      </div>

      {alertType === 'BUDGET_THRESHOLD' && (
        <>
          <div className="form-group">
            <label>Budget</label>
            <select value={budgetId} onChange={(e) => setBudgetId(e.target.value)} required>
              <option value="">Select a Budget</option>
              {budgets.map((b) => (
                <option key={b.id} value={b.id}>{b.category} - {b.year}/{b.month + 1}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Threshold (%)</label>
            <input
              type="number"
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
              min="1"
              max="100"
              required
            />
          </div>
        </>
      )}

      {alertType === 'BILL_DUE' && (
        <>
          <div className="form-group">
            <label>Recurring Bill</label>
            <select value={recurringTransactionId} onChange={(e) => setRecurringTransactionId(e.target.value)} required>
              <option value="">Select a Bill</option>
              {recurringTransactions
                .filter(t => t.type === 'expense')
                .map((t) => (
                <option key={t.id} value={t.id}>{t.description}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Notify Me</label>
            <select value={timing} onChange={(e) => setTiming(e.target.value as BillDueTiming)} required>
              <option value="ON_DUE_DATE">On Due Date</option>
              <option value="1_DAY_BEFORE">1 Day Before</option>
              <option value="3_DAYS_BEFORE">3 Days Before</option>
              <option value="7_DAYS_BEFORE">7 Days Before</option>
            </select>
          </div>
        </>
      )}

      {alertType === 'GOAL_PROGRESS' && (
        <div className="form-group">
          <label>Goal</label>
          <select value={goalId} onChange={(e) => setGoalId(e.target.value)} required>
            <option value="">Select a Goal</option>
            {goals.map((g) => (
              <option key={g.id} value={g.id}>{g.title}</option>
            ))}
          </select>
        </div>
      )}

      <div className="form-group">
        <label>
          <input
            type="checkbox"
            checked={isEnabled}
            onChange={(e) => setIsEnabled(e.target.checked)}
          />
          Enabled
        </label>
      </div>

      <button type="submit">Save Rule</button>
    </form>
  );
};

export default AlertRuleForm;