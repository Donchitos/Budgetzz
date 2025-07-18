// src/components/BudgetManager.tsx

import React, { useState } from 'react';
import { db, auth } from '../firebase';
import { collection, addDoc, query, where, serverTimestamp, doc, setDoc } from 'firebase/firestore';
import { useCollection } from 'react-firebase-hooks/firestore';

const categories = ["Food", "Transport", "Housing", "Utilities", "Entertainment", "Other"];

function BudgetManager() {
  const [category, setCategory] = useState('Food');
  const [budgetAmount, setBudgetAmount] = useState('');

  // Reference to the 'budgets' collection
  const budgetsRef = collection(db, 'budgets');
  // Query for the current user's budgets
  const q = auth.currentUser ? query(budgetsRef, where('userId', '==', auth.currentUser.uid)) : query(budgetsRef);
  const [budgetsSnapshot, loading, error] = useCollection(q);

  const handleSetBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(budgetAmount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert("Please enter a valid budget amount.");
      return;
    }
    if (!auth.currentUser) return;

    try {
      // Use the category name as the document ID for simplicity
      // This ensures one budget per category for each user
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
    <div className="tracker-container">
      <h3>Set Your Budgets</h3>
      <form onSubmit={handleSetBudget}>
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>
        <input
          type="number"
          value={budgetAmount}
          onChange={(e) => setBudgetAmount(e.target.value)}
          placeholder="Budget Amount"
          required
        />
        <button type="submit">Set Budget</button>
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
    </div>
  );
}

export default BudgetManager;