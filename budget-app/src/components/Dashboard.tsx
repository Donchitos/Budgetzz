import { signOut } from 'firebase/auth';
import { collection, query, where } from 'firebase/firestore';
import { useCollection } from 'react-firebase-hooks/firestore';
import { auth, db } from '../firebase';
import ExpenseTracker from './ExpenseTracker';
import IncomeTracker from './IncomeTracker';
import ExpenseChart from './ExpenseChart'; // Import the new component
import BudgetManager from './BudgetManager';
import BudgetComparison from './BudgetComparison';

function Dashboard() {
  // --- Data fetching logic remains the same ---
  const incomeRef = collection(db, 'income');
  const incomeQuery = auth.currentUser ? query(incomeRef, where('userId', '==', auth.currentUser.uid)) : query(incomeRef);
  const [incomeSnapshot] = useCollection(incomeQuery);
  const totalIncome = incomeSnapshot?.docs.reduce((total, doc) => total + doc.data().amount, 0) || 0;

  const expensesRef = collection(db, 'expenses');
  const expensesQuery = auth.currentUser ? query(expensesRef, where('userId', '==', auth.currentUser.uid)) : query(expensesRef);
  const [expensesSnapshot] = useCollection(expensesQuery);
  
  const budgetsRef = collection(db, 'budgets');
  const budgetsQuery = auth.currentUser ? query(budgetsRef, where('userId', '==', auth.currentUser.uid)) : query(budgetsRef);
  const [budgetsSnapshot] = useCollection(budgetsQuery);

  const totalExpenses = expensesSnapshot?.docs.reduce((total, doc) => total + doc.data().amount, 0) || 0;
  const balance = totalIncome - totalExpenses;
  // --- End of data fetching logic ---

  const handleLogout = () => {
    signOut(auth);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Welcome, {auth.currentUser?.email}</h1>
        <div>
          <h2>Balance: ${balance.toFixed(2)}</h2>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </div>
      <hr />
      
      <ExpenseChart expensesSnapshot={expensesSnapshot} />
      
      <hr />
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', alignItems: 'start' }}>
        <BudgetManager />
        <BudgetComparison budgetsSnapshot={budgetsSnapshot} expensesSnapshot={expensesSnapshot} />
      </div>

      <hr />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', alignItems: 'start' }}>
        <div className="tracker-container">
          <IncomeTracker />
        </div>
        <div className="tracker-container">
          <ExpenseTracker />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;