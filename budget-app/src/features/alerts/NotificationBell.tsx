import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import useFirestoreCollection from '../../hooks/useFirestoreCollection';
import type { Notification } from '../../types/alerts';
import NotificationList from './NotificationList';
import './NotificationBell.css';

const NotificationBell: React.FC = () => {
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

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleClickOutside = (event: MouseEvent) => {
    const target = event.target as HTMLElement;
    if (!target.closest('.notification-bell')) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isOpen]);

  return (
    <div className="notification-bell">
      <button 
        className="bell-button"
        onClick={handleToggle}
        aria-label={`Notifications ${unseenCount > 0 ? `(${unseenCount} unread)` : ''}`}
        title={`Notifications ${unseenCount > 0 ? `(${unseenCount} unread)` : ''}`}
      >
        <Bell size={20} className="bell-icon" />
        {unseenCount > 0 && (
          <span className="notification-badge" aria-label={`${unseenCount} unread notifications`}>
            {unseenCount > 99 ? '99+' : unseenCount}
          </span>
        )}
      </button>
      {isOpen && (
        <div className="notification-dropdown">
          <NotificationList />
        </div>
      )}
    </div>
  );
};

export default NotificationBell;