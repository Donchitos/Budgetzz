import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from './services/firebase';

import Login from './features/auth/Login';
import Register from './features/auth/Register';
import Dashboard from './features/dashboard/Dashboard';
import AlertsPage from './features/alerts/AlertsPage';
import NotificationBell from './features/alerts/NotificationBell';
import './App.css';


function App() {
  const [user, loading] = useAuthState(auth);

  if (loading) {
    return <div>Loading...</div>; // Show a loading indicator while checking auth state
  }

  return (
    <Router>
      {user && (
        <header>
          <nav>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/alerts">Alerts</Link>
            <NotificationBell />
          </nav>
        </header>
      )}
      <main>
        <Routes>
          <Route path="/" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
          <Route path="/register" element={!user ? <Register /> : <Navigate to="/dashboard" />} />
          <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/" />} />
          <Route path="/alerts" element={user ? <AlertsPage /> : <Navigate to="/" />} />
        </Routes>
      </main>
    </Router>
  );
}

export default App;