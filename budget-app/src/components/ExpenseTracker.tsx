import React, { useState } from 'react';
import { db, auth } from '../firebase';
import { collection, addDoc, query, where, serverTimestamp } from 'firebase/firestore';
import { useCollection } from 'react-firebase-hooks/firestore';

function ExpenseTracker() {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');

  const expensesRef = collection(db, 'expenses');
  const q = auth.currentUser ? query(expensesRef, where('userId', '==', auth.currentUser.uid)) : query(expensesRef);
  const [expensesSnapshot, loading, error] = useCollection(q);

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!auth.currentUser) {
      alert("You must be logged in to add an expense.");
      return;
    }

    // --- THIS VALIDATION BLOCK IS THE CRITICAL FIX ---
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert("Please enter a valid amount greater than 0.");
      return; // Stop the function here
    }
    // --- END OF VALIDATION BLOCK ---

    try {
      const expenseData = {
        description: description,
        amount: parsedAmount, // Use the validated number
        createdAt: serverTimestamp(),
        userId: auth.currentUser.uid
      };

      // --- ADD THIS DEBUGGING LINE ---
      console.log("Attempting to save this data:", expenseData);

      await addDoc(collection(db, 'expenses'), expenseData);
      
      setDescription('');
      setAmount('');
    } catch (err) {
      console.error("Error adding expense: ", err);
      alert("Failed to add expense. Check console for details.");
    }
  };

  return (
    <div>
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
        <button type="submit">Add Expense</button>
      </form>

      <hr />

      <h3>Your Expenses</h3>
      {loading && <p>Loading expenses...</p>}
      {error && <p>Error loading expenses: {error.message}</p>}
      <ul>
        {expensesSnapshot?.docs.map(doc => (
          <li key={doc.id}>
            {doc.data().description}: ${doc.data().amount.toFixed(2)}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ExpenseTracker;