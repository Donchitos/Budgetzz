import React from 'react';
import UserProfile from './UserProfile';
import AppPreferences from './AppPreferences';
import NotificationPreferences from './NotificationPreferences';

const SettingsPage: React.FC = () => {
  return (
    <div className="settings-page">
      <h1>Settings</h1>
      <UserProfile />
      <AppPreferences />
      <NotificationPreferences />
    </div>
  );
};

export default SettingsPage;