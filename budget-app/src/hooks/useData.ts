import { useMemo } from 'react';
import useFirestoreCollection from './useFirestoreCollection';

export const useData = <T>(collectionName: string) => {
  const { snapshot, loading, error } = useFirestoreCollection(collectionName);

  const data = useMemo(() => {
    if (!snapshot) return [];
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as T & { id: string }));
  }, [snapshot]);

  return { data, loading, error };
};