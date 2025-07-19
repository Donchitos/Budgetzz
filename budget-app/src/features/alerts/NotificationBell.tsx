import React, { useState, useEffect } from 'react';
import useFirestoreCollection from '../../hooks/useFirestoreCollection';
import type { Notification } from '../../types/alerts';
import NotificationList from './NotificationList';
import './NotificationBell.css';

const NotificationBell = () => {
  const { snapshot } = useFirestoreCollection('notifications');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (snapshot) {
      const unseen = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as Notification))
        .filter(n => !n.status.seen && !n.status.dismissed);
      setNotifications(unseen);
    }
  }, [snapshot]);

  const unseenCount = notifications.length;

  return (
    <div className="notification-bell">
      <div className="bell-icon" onClick={() => setIsOpen(!isOpen)}>
        <span>🔔</span>
        {unseenCount > 0 && <span className="badge">{unseenCount}</span>}
      </div>
      {isOpen && <NotificationList />}
    </div>
  );
};

export default NotificationBell;