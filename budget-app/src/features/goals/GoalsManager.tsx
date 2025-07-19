import React, { useState } from 'react';
import useFirestoreCollection from '../../hooks/useFirestoreCollection';
import type { FinancialGoal } from '../../types/goals';
import { collection, addDoc } from 'firebase/firestore';
import { db, auth } from '../../services/firebase';

const GoalsManager: React.FC = () => {
  const { snapshot, loading, error } = useFirestoreCollection('financial-goals');
  const [goalName, setGoalName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [deadline, setDeadline] = useState('');

  const goals: FinancialGoal[] = snapshot ? snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FinancialGoal)) : [];

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) {
      alert('You must be logged in to create a goal.');
      return;
    }
    try {
      await addDoc(collection(db, 'financial-goals'), {
        userId: auth.currentUser.uid,
        title: goalName,
        targetAmount: parseFloat(targetAmount),
        currentAmount: 0,
        targetDate: deadline,
        priority: 'medium',
        category: 'other',
        isCompleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      setGoalName('');
      setTargetAmount('');
      setDeadline('');
    } catch (err) {
      console.error('Error creating goal:', err);
    }
  };

  if (loading) return <p>Loading goals...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div>
      <h2>Goals Manager</h2>
      <form onSubmit={handleCreateGoal}>
        <input
          type="text"
          value={goalName}
          onChange={(e) => setGoalName(e.target.value)}
          placeholder="Goal Name"
          required
        />
        <input
          type="number"
          value={targetAmount}
          onChange={(e) => setTargetAmount(e.target.value)}
          placeholder="Target Amount"
          required
        />
        <input
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          required
        />
        <button type="submit">Add Goal</button>
      </form>
      <div>
        <h3>Your Goals</h3>
        {goals.map((goal: FinancialGoal) => (
          <div key={goal.id}>
            <p>{goal.title}</p>
            <p>Target: ${goal.targetAmount}</p>
            <p>Saved: ${goal.currentAmount}</p>
            <p>Deadline: {goal.targetDate}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GoalsManager;