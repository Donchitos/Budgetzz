// src/components/BudgetManager.tsx

import React, { useState } from 'react';
import { db, auth } from '../../services/firebase';
import { serverTimestamp, doc, setDoc } from 'firebase/firestore';
import useFirestoreCollection from '../../hooks/useFirestoreCollection';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Button from '../../components/Button';

const categories = ["Food", "Transport", "Housing", "Utilities", "Entertainment", "Other"];

function BudgetManager() {
  const { snapshot: budgetsSnapshot, loading, error } = useFirestoreCollection('budgets');
  const [category, setCategory] = useState('Food');
  const [budgetAmount, setBudgetAmount] = useState('');

  const handleSetBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(budgetAmount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert("Please enter a valid budget amount.");
      return;
    }
    if (!auth.currentUser) return;

    try {
      const budgetDocRef = doc(db, 'budgets', `${auth.currentUser.uid}_${category}`);
      await setDoc(budgetDocRef, {
        category: category,
        budgetAmount: parsedAmount,
        userId: auth.currentUser.uid,
        updatedAt: serverTimestamp()
      });
      setBudgetAmount('');
    } catch (err) {
      console.error("Error setting budget: ", err);
    }
  };

  return (
    <Card title="Set Your Budgets">
      <form onSubmit={handleSetBudget}>
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>
        <Input
          type="number"
          value={budgetAmount}
          onChange={(e) => setBudgetAmount(e.target.value)}
          placeholder="Budget Amount"
          required
        />
        <Button type="submit">Set Budget</Button>
      </form>

      <hr />

      <h3>Current Budgets</h3>
      {loading && <p>Loading...</p>}
      {error && <p>Error loading budgets.</p>}
      <ul>
        {budgetsSnapshot?.docs.map(doc => (
          <li key={doc.id}>
            <span>{doc.data().category}</span>
            <span>${doc.data().budgetAmount.toFixed(2)}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}

export default BudgetManager;