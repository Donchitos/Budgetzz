import React, { useState, useEffect } from 'react';
import { getUserNotificationPreferences, setUserNotificationPreferences } from '../../services/api';
import type { UserNotificationPreference } from '../../types/alerts';
import { auth } from '../../services/firebase';
import { Timestamp } from 'firebase/firestore';
import Skeleton from '../../components/Skeleton';

const NotificationPreferences: React.FC = () => {
  const [preferences, setPreferences] = useState<UserNotificationPreference | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPreferences = async () => {
      if (auth.currentUser) {
        setLoading(true);
        const prefs = await getUserNotificationPreferences();
        if (prefs) {
          setPreferences(prefs);
        } else {
          // Initialize with default preferences if none exist
          const defaultPrefs: UserNotificationPreference = {
            id: auth.currentUser.uid,
            userId: auth.currentUser.uid,
            channels: {
              email: { isEnabled: true, address: auth.currentUser.email || '' },
              push: { isEnabled: true },
              inApp: { isEnabled: true },
            },
            doNotDisturb: {
              isEnabled: false,
              startTime: '22:00',
              endTime: '08:00',
            },
            updatedAt: Timestamp.now(),
          };
          setPreferences(defaultPrefs);
        }
        setLoading(false);
      }
    };

    fetchPreferences();
  }, []);

  const handleChannelChange = (channel: 'email' | 'push' | 'inApp', isEnabled: boolean) => {
    if (preferences) {
      const newChannels = { ...preferences.channels, [channel]: { ...preferences.channels[channel], isEnabled } };
      setPreferences({ ...preferences, channels: newChannels });
    }
  };

  const handleDndChange = (field: 'isEnabled' | 'startTime' | 'endTime', value: boolean | string) => {
    if (preferences) {
      const newDnd = { ...preferences.doNotDisturb, [field]: value };
      setPreferences({ ...preferences, doNotDisturb: newDnd });
    }
  };

  const handleSave = async () => {
    if (preferences) {
      setLoading(true);
      await setUserNotificationPreferences(preferences);
      setLoading(false);
      alert('Preferences saved!');
    }
  };

  if (loading) {
    return (
      <div className="card">
        <h2>Notification Preferences</h2>
        <div className="form-group">
          <Skeleton className="h-5 w-48" />
        </div>
        <div className="form-group">
          <Skeleton className="h-5 w-48" />
        </div>
        <div className="form-group">
          <Skeleton className="h-5 w-48" />
        </div>
        <h3>Do Not Disturb</h3>
        <div className="form-group">
          <Skeleton className="h-5 w-48" />
        </div>
        <Skeleton className="h-10 w-32 mt-4" />
      </div>
    );
  }

  if (!preferences) {
    return <div>Could not load preferences.</div>;
  }

  return (
    <div className="card">
      <h2>Notification Preferences</h2>
      <div className="form-group">
        <label>
          <input
            type="checkbox"
            checked={preferences.channels.email.isEnabled}
            onChange={(e) => handleChannelChange('email', e.target.checked)}
          />
          Email Notifications
        </label>
      </div>
      <div className="form-group">
        <label>
          <input
            type="checkbox"
            checked={preferences.channels.push.isEnabled}
            onChange={(e) => handleChannelChange('push', e.target.checked)}
          />
          Push Notifications
        </label>
      </div>
      <div className="form-group">
        <label>
          <input
            type="checkbox"
            checked={preferences.channels.inApp.isEnabled}
            onChange={(e) => handleChannelChange('inApp', e.target.checked)}
          />
          In-App Notifications
        </label>
      </div>

      <h3>Do Not Disturb</h3>
      <div className="form-group">
        <label>
          <input
            type="checkbox"
            checked={preferences.doNotDisturb.isEnabled}
            onChange={(e) => handleDndChange('isEnabled', e.target.checked)}
          />
          Enable Do Not Disturb
        </label>
      </div>
      {preferences.doNotDisturb.isEnabled && (
        <>
          <div className="form-group">
            <label>Start Time</label>
            <input
              type="time"
              value={preferences.doNotDisturb.startTime}
              onChange={(e) => handleDndChange('startTime', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>End Time</label>
            <input
              type="time"
              value={preferences.doNotDisturb.endTime}
              onChange={(e) => handleDndChange('endTime', e.target.value)}
            />
          </div>
        </>
      )}

      <button onClick={handleSave} disabled={loading}>
        {loading ? 'Saving...' : 'Save Preferences'}
      </button>
    </div>
  );
};

export default NotificationPreferences;