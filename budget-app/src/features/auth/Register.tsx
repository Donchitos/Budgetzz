import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../services/firebase';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Card from '../../components/Card';
import './Auth.css';

function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error("Error registering: ", error);
      alert("Failed to register. Please try again.");
    }
  };

  return (
    <div className="auth-container">
      <Card title="Create Your Account" className="auth-card">
        <form onSubmit={handleRegister} className="auth-form">
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
              placeholder="At least 8 characters"
              required
            />
          </div>
          <Button type="submit">Create Account</Button>
        </form>
        <div className="auth-footer">
          <p>
            Already have an account? <Link to="/">Login here</Link>.
          </p>
          <p>
            By creating an account, you agree to our <Link to="/privacy">Privacy Policy</Link>.
          </p>
        </div>
        <div className="security-info">
          <p>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
            Your information is always kept private and secure.
          </p>
        </div>
      </Card>
    </div>
  );
}

export default Register;