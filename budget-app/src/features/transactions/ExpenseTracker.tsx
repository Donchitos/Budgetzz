// src/features/transactions/ExpenseTracker.tsx
import { db, auth } from '../../services/firebase';
import { collection, addDoc, serverTimestamp, deleteDoc, doc } from 'firebase/firestore';
import useFirestoreCollection from '../../hooks/useFirestoreCollection';
import TransactionForm from './TransactionForm';
import Card from '../../components/Card';
import Button from '../../components/Button';

function ExpenseTracker() {
  const { snapshot: expensesSnapshot, loading, error } = useFirestoreCollection('expenses');
  const expensesRef = collection(db, 'expenses');

  const totalExpenses = expensesSnapshot?.docs.reduce((total, doc) => total + doc.data().amount, 0);

  const handleAddExpense = async (description: string, amount: number, category?: string) => {
    if (!auth.currentUser) return;
    try {
      await addDoc(expensesRef, {
        description,
        amount,
        category,
        createdAt: serverTimestamp(),
        userId: auth.currentUser.uid
      });
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
    <Card title="Expense Tracker">
      <TransactionForm onAddTransaction={handleAddExpense} transactionType="Expense" />
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
              <Button onClick={() => handleDeleteExpense(doc.id)} style={{ marginLeft: '10px' }}>
                Delete
              </Button>
            </span>
          </li>
        ))}
      </ul>
    </Card>
  );
}

export default ExpenseTracker;
