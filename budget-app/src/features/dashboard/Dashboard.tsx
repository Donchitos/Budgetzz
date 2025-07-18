import { signOut } from 'firebase/auth';
import { auth } from '../../services/firebase';
import useFirestoreCollection from '../../hooks/useFirestoreCollection';
import ExpenseTracker from '../../features/transactions/ExpenseTracker';
import IncomeTracker from '../../features/transactions/IncomeTracker';
import ExpenseChart from '../../features/transactions/ExpenseChart';
import BudgetManager from '../../features/budget/BudgetManager';
import BudgetComparison from '../../features/budget/BudgetComparison';
import Button from '../../components/Button';

function Dashboard() {
  const { snapshot: incomeSnapshot } = useFirestoreCollection('income');
  const { snapshot: expensesSnapshot } = useFirestoreCollection('expenses');
  const { snapshot: budgetsSnapshot } = useFirestoreCollection('budgets');

  const totalIncome = incomeSnapshot?.docs.reduce((total, doc) => total + doc.data().amount, 0) || 0;
  const totalExpenses = expensesSnapshot?.docs.reduce((total, doc) => total + doc.data().amount, 0) || 0;
  const balance = totalIncome - totalExpenses;

  const handleLogout = () => {
    signOut(auth);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Welcome, {auth.currentUser?.email}</h1>
        <div>
          <h2>Balance: ${balance.toFixed(2)}</h2>
          <Button onClick={handleLogout}>Logout</Button>
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
        <IncomeTracker />
        <ExpenseTracker />
      </div>
    </div>
  );
}

export default Dashboard;