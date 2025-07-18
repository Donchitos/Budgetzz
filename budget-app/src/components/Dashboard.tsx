import { signOut } from 'firebase/auth';
import { auth } from '../firebase';

function Dashboard() {
  const handleLogout = () => {
    signOut(auth);
  };

  return (
    <div>
      <h1>Welcome to Your Dashboard</h1>
      <p>You are logged in!</p>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}

export default Dashboard;