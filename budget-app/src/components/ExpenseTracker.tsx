// src/components/ExpenseTracker.tsx

import React, { useState } from 'react';
import { db, auth } from '../firebase';
import { collection, addDoc, query, where, serverTimestamp, deleteDoc, doc } from 'firebase/firestore';
import { useCollection } from 'react-firebase-hooks/firestore';

function ExpenseTracker() {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food'); // State for category

  const expensesRef = collection(db, 'expenses');
  const q = auth.currentUser ? query(expensesRef, where('userId', '==', auth.currentUser.uid)) : query(expensesRef);
  const [expensesSnapshot, loading, error] = useCollection(q);

  const totalExpenses = expensesSnapshot?.docs.reduce((total, doc) => total + doc.data().amount, 0);

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert("Please enter a valid amount greater than 0.");
      return;
    }
    if (!auth.currentUser) return;
    try {
      await addDoc(expensesRef, {
        description: description,
        amount: parsedAmount,
        category: category, // Add category to the saved data
        createdAt: serverTimestamp(),
        userId: auth.currentUser.uid
      });
      setDescription('');
      setAmount('');
    } catch (err) {
      console.error("Error adding expense: ", err);
    }
  };

  const handleDeleteExpense = async (id: string) => {
    try {
      const expenseDocRef = doc(db, 'expenses', id);
      await deleteDoc(expenseDocRef);
    } catch (err) {
      console.error("Error deleting expense: ", err);
    }
  };

  return (
    <div className="tracker-container">
      <h3>Add Expense</h3>
      <form onSubmit={handleAddExpense}>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Expense description"
          required
        />
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount"
          required
        />
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="Food">Food</option>
          <option value="Transport">Transport</option>
          <option value="Housing">Housing</option>
          <option value="Utilities">Utilities</option>
          <option value="Entertainment">Entertainment</option>
          <option value="Other">Other</option>
        </select>
        <button type="submit">Add Expense</button>
      </form>

      <hr />
      
      <h2>Total Expenses: ${totalExpenses?.toFixed(2)}</h2>

      <h3>Your Expenses</h3>
      {loading && <p>Loading...</p>}
      {error && <p>Error loading expenses.</p>}
      <ul>
        {expensesSnapshot?.docs.map(doc => (
          <li key={doc.id}>
            <span><strong>{doc.data().category || 'Uncategorized'}:</strong> {doc.data().description}</span>
            <span>
              ${doc.data().amount.toFixed(2)}
              <button onClick={() => handleDeleteExpense(doc.id)} style={{ marginLeft: '10px' }}>
                Delete
              </button>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ExpenseTracker;