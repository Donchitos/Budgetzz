import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Card from '../../components/Card';
import { useAuthForm } from './useAuthForm';
import './Auth.css';

interface AuthFormProps {
  mode: 'login' | 'register';
}

const AuthForm: React.FC<AuthFormProps> = ({ mode }) => {
  const {
    email,
    setEmail,
    password,
    setPassword,
    error,
    loading,
    handleSubmit,
  } = useAuthForm(mode);

  const isLogin = mode === 'login';
  const title = isLogin ? 'Welcome Back' : 'Create Your Account';
  const buttonText = isLogin ? 'Login Securely' : 'Create Account';
  const footerText = isLogin ? "Don't have an account?" : 'Already have an account?';
  const footerLink = isLogin ? '/register' : '/';
  const footerLinkText = isLogin ? 'Create one now' : 'Login here';

  return (
    <div className="auth-container">
      <Card title={title} className="auth-card">
        <form onSubmit={handleSubmit} className="auth-form">
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
              placeholder={isLogin ? '••••••••' : 'At least 8 characters'}
              required
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <Button type="submit" disabled={loading}>
            {loading ? 'Processing...' : buttonText}
          </Button>
        </form>
        <div className="auth-footer">
          <p>
            {footerText}{' '}
            <Link to={footerLink}>{footerLinkText}</Link>.
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
};

export default AuthForm;