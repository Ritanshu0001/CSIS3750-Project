// AccountPage.js
import React, { useEffect, useState } from 'react';
import './AccountPage.css';

function AccountPage() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const username = localStorage.getItem('username');
    if (!username) return;

    fetch(`http://localhost:5000/test/users/${username}`)
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.error) {
          setUser(data);
        } else {
          setError('User not found or error retrieving user.');
        }
      })
      .catch((err) => {
        console.error("Failed to fetch user data:", err);
        setError("Something went wrong while loading your profile.");
      });
  }, []);

  if (error) {
    return <div className="account-page"><p>{error}</p></div>;
  }

  if (!user) {
    return <div className="account-page"><p>Loading user data...</p></div>;
  }

  return (
    <div className="account-page">
      <div className="account-container">
        <h2 className="profile-heading">Profile Information:</h2>
        <div className="profile-card">
          <div className="profile-left">
            <img
              src={user.profilePicture || '/defaultAvatar.png'}
              alt="User Avatar"
              className="profile-avatar"
            />
            <div className="edit-label">
              Edit <span className="edit-icon">✏️</span>
            </div>
          </div>
          <div className="profile-details">
            <ul>
              <li><strong>Display Name:</strong> {user.displayName || user.username}</li>
              <li><strong>Email:</strong> {user.email}</li>
              <li><strong>Phone Number:</strong> {user.phoneNumber || 'N/A'}</li>
              <li><strong>University:</strong> {user.university || 'N/A'}</li>
              <li><strong>Time Zone:</strong> {Intl.DateTimeFormat().resolvedOptions().timeZone}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AccountPage;

