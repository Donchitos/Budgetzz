import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../services/firebase';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Card from '../../components/Card';

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
    <Card title="Register">
      <form onSubmit={handleRegister}>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
        />
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />
        <Button type="submit">Register</Button>
      </form>
      <p>
        Already have an account? <Link to="/">Login here</Link>.
      </p>
    </Card>
  );
}

export default Register;