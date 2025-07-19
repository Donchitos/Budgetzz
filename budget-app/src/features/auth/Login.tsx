import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../services/firebase';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Card from '../../components/Card';
import './Auth.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error("Error logging in: ", error);
      alert("Failed to log in. Check your credentials.");
    }
  };

  return (
    <div className="auth-container">
      <Card title="Welcome Back" className="auth-card">
        <form onSubmit={handleLogin} className="auth-form">
          <div className="input-group">
            <label htmlFor="email">Email Address</label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          <Button type="submit">Login Securely</Button>
        </form>
        <div className="auth-footer">
          <p>
            Don't have an account? <Link to="/register">Create one now</Link>.
          </p>
          <p>
            <Link to="/privacy">Privacy Policy</Link>
          </p>
        </div>
        <div className="security-info">
          <p>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
            Your data is protected with bank-level security.
          </p>
        </div>
      </Card>
    </div>
  );
}

export default Login;