// src/components/Dashboard.tsx

import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import ExpenseTracker from './ExpenseTracker'; // <-- Import the component

function Dashboard() {
  const handleLogout = () => {
    signOut(auth);
  };

  return (
    <div>
      <h1>Welcome to Your Dashboard</h1>
      <p>You are logged in as {auth.currentUser?.email}</p>
      <button onClick={handleLogout}>Logout</button>
      <hr />
      <ExpenseTracker /> {/* <-- Add the component here */}
    </div>
  );
}

export default Dashboard;