import React, { useEffect } from 'react';
import useFirestoreCollection from '../../hooks/useFirestoreCollection';
import type { Notification } from '../../types/alerts';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import './NotificationList.css';

const NotificationList = () => {
  const { snapshot } = useFirestoreCollection('notifications');

  const notifications = snapshot ? snapshot.docs
    .map(doc => ({ id: doc.id, ...doc.data() } as Notification))
    .filter(n => !n.status.dismissed) : [];

  useEffect(() => {
    const unseenIds = notifications.filter(n => !n.status.seen).map(n => n.id);
    if (unseenIds.length > 0) {
      unseenIds.forEach(id => {
        const docRef = doc(db, 'notifications', id);
        updateDoc(docRef, { 'status.seen': true });
      });
    }
  }, [notifications]);

  const handleDismiss = (id: string) => {
    const docRef = doc(db, 'notifications', id);
    updateDoc(docRef, { 'status.dismissed': true });
  };

  return (
    <div className="notification-list">
      {notifications.length === 0 ? (
        <p>No new notifications</p>
      ) : (
        <ul>
          {notifications.map(n => (
            <li key={n.id} className={n.status.seen ? 'seen' : 'unseen'}>
              <p>{n.content.body}</p>
              <button onClick={() => handleDismiss(n.id)}>Dismiss</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default NotificationList;