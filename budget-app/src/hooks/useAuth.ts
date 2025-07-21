import { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged, type User } from 'firebase/auth';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, [auth]);

  const logout = () => {
    auth.signOut();
  };

  return { user, logout };
};