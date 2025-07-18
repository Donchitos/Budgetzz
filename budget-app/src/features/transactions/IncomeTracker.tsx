import React from 'react';
import { db, auth } from '../../services/firebase';
import { collection, addDoc, serverTimestamp, deleteDoc, doc } from 'firebase/firestore';
import useFirestoreCollection from '../../hooks/useFirestoreCollection';
import TransactionForm from './TransactionForm';
import Card from '../../components/Card';
import Button from '../../components/Button';

function IncomeTracker() {
  const { snapshot: incomeSnapshot, loading, error } = useFirestoreCollection('income');
  const incomeRef = collection(db, 'income');

  const totalIncome = incomeSnapshot?.docs.reduce(
    (total, doc) => total + doc.data().amount,
    0
  );

  const handleAddIncome = async (description: string, amount: number) => {
    if (!auth.currentUser) return;
    try {
      await addDoc(incomeRef, {
        description,
        amount,
        createdAt: serverTimestamp(),
        userId: auth.currentUser.uid
      });
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
    <Card title="Income Tracker">
      <TransactionForm onAddTransaction={handleAddIncome} transactionType="Income" />
      <hr />
      <h2>Total Income: ${totalIncome?.toFixed(2)}</h2>
      <h3>Your Income Sources</h3>
      {loading && <p>Loading...</p>}
      {error && <p>Error loading income.</p>}
      <ul>
        {incomeSnapshot?.docs.map(doc => (
          <li key={doc.id}>
            {doc.data().description}: ${doc.data().amount.toFixed(2)}
            <Button onClick={() => handleDeleteIncome(doc.id)} style={{ marginLeft: '10px' }}>
              Delete
            </Button>
          </li>
        ))}
      </ul>
    </Card>
  );
}

export default IncomeTracker;