import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';
import type { UserProgress } from '../types/gamification';
import { useAuth } from './useAuth';

export const useUserProgress = () => {
  const { user } = useAuth();
  const [progress, setProgress] = useState<UserProgress | null>(null);

  useEffect(() => {
    if (user) {
      const unsubscribe = onSnapshot(doc(db, 'userProgress', user.uid), (doc) => {
        if (doc.exists()) {
          setProgress(doc.data() as UserProgress);
        }
      });

      return () => unsubscribe();
    }
  }, [user]);

  return { progress };
};