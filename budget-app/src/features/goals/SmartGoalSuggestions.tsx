import React from 'react';
import useFirestoreCollection from '../../hooks/useFirestoreCollection';
import type { FinancialGoal } from '../../types/goals';
import { collection, addDoc } from 'firebase/firestore';
import { db, auth } from '../../services/firebase';

// Mock monthly expenses - in a real app, this would come from budget data
const MOCK_MONTHLY_EXPENSES = 2000;

const SmartGoalSuggestions: React.FC = () => {
  const { snapshot, loading, error } = useFirestoreCollection('financial-goals');

  const goals = snapshot?.docs.map(doc => ({ id: doc.id, ...doc.data() })) as FinancialGoal[] || [];

  const hasEmergencyFund = goals.some(
    (goal) => goal.title.toLowerCase().includes('emergency fund')
  );

  const handleCreateEmergencyFund = async () => {
    if (!auth.currentUser) return;
    const targetAmount = MOCK_MONTHLY_EXPENSES * 3; // 3 months of expenses
    try {
      await addDoc(collection(db, 'financial-goals'), {
        userId: auth.currentUser.uid,
        title: 'Emergency Fund',
        targetAmount,
        currentAmount: 0,
        targetDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0], // 1 year from now
        priority: 'critical',
        category: 'emergency-fund',
        isCompleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        description: 'A fund for unexpected expenses, providing financial security.'
      });
      alert('Emergency Fund goal created!');
    } catch (err) {
      console.error("Error creating emergency fund:", err);
    }
  };

  if (loading) return null; // Don't show anything while loading
  if (error) return null; // Or if there's an error

  return (
    <div className="smart-suggestions">
      {!hasEmergencyFund && MOCK_MONTHLY_EXPENSES > 0 && (
        <div className="suggestion-card">
          <h4>Build Your Safety Net</h4>
          <p>You don't have an emergency fund. We recommend saving 3-6 months of expenses.</p>
          <button onClick={handleCreateEmergencyFund}>Create Emergency Fund Goal</button>
        </div>
      )}
    </div>
  );
};

export default SmartGoalSuggestions;