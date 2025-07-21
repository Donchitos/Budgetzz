import React from 'react';
import { useAuth } from '../../hooks/useAuth'; // Assuming useAuth hook provides user info and logout

const UserProfile: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div className="user-profile">
      <h2>User Profile</h2>
      {user ? (
        <>
          <p>Email: {user.email}</p>
          <button onClick={logout}>Logout</button>
        </>
      ) : (
        <p>Please log in.</p>
      )}
    </div>
  );
};

export default UserProfile;