import React, { useState } from 'react';
import { db, auth } from '../firebase';
import { collection, addDoc, query, where, serverTimestamp, deleteDoc, doc } from 'firebase/firestore';
import { useCollection } from 'react-firebase-hooks/firestore';

function IncomeTracker() {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');

  // Reference to the 'income' collection
  const incomeRef = collection(db, 'income');
  // Query for the current user's income
  const q = auth.currentUser ? query(incomeRef, where('userId', '==', auth.currentUser.uid)) : query(incomeRef);
  const [incomeSnapshot, loading, error] = useCollection(q);

  // Calculate the total income
  const totalIncome = incomeSnapshot?.docs.reduce(
    (total, doc) => total + doc.data().amount,
    0
  );

  const handleAddIncome = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert("Please enter a valid amount greater than 0.");
      return;
    }
    if (!auth.currentUser) return;

    try {
      await addDoc(incomeRef, {
        description: description,
        amount: parsedAmount,
        createdAt: serverTimestamp(),
        userId: auth.currentUser.uid
      });
      setDescription('');
      setAmount('');
    } catch (err) {
      console.error("Error adding income: ", err);
    }
  };

  const handleDeleteIncome = async (id: string) => {
    try {
      const incomeDocRef = doc(db, 'income', id);
      await deleteDoc(incomeDocRef);
    } catch (err) {
      console.error("Error deleting income: ", err);
    }
  };

  return (
    <div>
      <h3>Add Income</h3>
      <form onSubmit={handleAddIncome}>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Income source"
          required
        />
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount"
          required
        />
        <button type="submit">Add Income</button>
      </form>

      <hr />

      <h2>Total Income: ${totalIncome?.toFixed(2)}</h2>

      <h3>Your Income Sources</h3>
      {loading && <p>Loading...</p>}
      {error && <p>Error loading income.</p>}
      <ul>
        {incomeSnapshot?.docs.map(doc => (
          <li key={doc.id}>
            {doc.data().description}: ${doc.data().amount.toFixed(2)}
            <button onClick={() => handleDeleteIncome(doc.id)} style={{ marginLeft: '10px' }}>
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default IncomeTracker;