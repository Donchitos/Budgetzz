import { useCollection } from 'react-firebase-hooks/firestore';
import { collection, query, where } from 'firebase/firestore';
import { db, auth } from '../services/firebase';

const useFirestoreCollection = (collectionName: string) => {
  const collectionRef = collection(db, collectionName);
  const q = auth.currentUser ? query(collectionRef, where('userId', '==', auth.currentUser.uid)) : query(collectionRef);
  const [snapshot, loading, error] = useCollection(q);

  return { snapshot, loading, error };
};

export default useFirestoreCollection;