// src/components/Dashboard.tsx

import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import ExpenseTracker from './ExpenseTracker';
import IncomeTracker from './IncomeTracker';

function Dashboard() {
  const handleLogout = () => {
    signOut(auth);
  };

  // Find this style object
  const gridLayout = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '40px',
    alignItems: 'start' // <-- ADD THIS LINE
  };

  return (
    <div>
      <h1>Welcome to Your Dashboard</h1>
      <p>You are logged in as {auth.currentUser?.email}</p>
      <button onClick={handleLogout}>Logout</button>
      <hr />
      <div style={gridLayout}>
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