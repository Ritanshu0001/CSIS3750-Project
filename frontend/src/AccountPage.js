// AccountPage.js
import React, { useEffect, useState } from 'react';
import './AccountPage.css';

function AccountPage() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('http://localhost:5000/test/users/jm6013')
      .then((res) => {
        if (!res.ok) {
          throw new Error('Failed to fetch user');
        }
        return res.json();
      })
      .then((data) => {
        console.log("✅ Fetched user data:", data);
        setUser(data);
      })
      .catch((err) => {
        console.error('❌ Error fetching user:', err);
        setError('Failed to load user data.');
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
              <li><strong>Display Name:</strong> {user.displayName || user.user}</li>
              <li><strong>Email:</strong> {user.email}</li>
              <li><strong>Phone Number:</strong> {user.phoneNumber || 'N/A'}</li>
              <li><strong>University:</strong> {user.university || 'Nova Southeastern University'}</li>
              <li><strong>Time Zone:</strong> Eastern Time (US & Canada)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AccountPage;