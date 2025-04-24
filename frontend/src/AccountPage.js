// AccountPage.js
import React, { useEffect, useState } from 'react';
import './AccountPage.css'; // Make sure this file includes styles for .assignment-dialog if needed

function AccountPage() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const username = localStorage.getItem('username');
    if (!username) {
        setError('Username not found in local storage. Please log in.'); // More specific error
        return;
    };

    fetch(`http://localhost:5000/test/users/${username}`)
      .then((res) => {
          if (!res.ok) { // Check for HTTP errors (like 404 Not Found)
              throw new Error(`HTTP error! status: ${res.status}`);
          }
          return res.json();
      })
      .then((data) => {
        if (data && !data.error) { // Check for application-specific errors if backend sends them
          setUser(data);
        } else {
          // Handle cases where data is returned but indicates an error (e.g., { error: 'User not found' })
          setError(data.error || 'User not found or error retrieving user data.');
          setUser(null); // Ensure user state is null if there's an error
        }
      })
      .catch((err) => {
        console.error("Failed to fetch user data:", err);
        // Provide more specific feedback based on error type if possible
        if (err.message.includes('Failed to fetch')) {
             setError("Could not connect to the server. Please check your network connection.");
        } else if (err.message.includes('404')) {
             setError(`User profile for "${username}" not found.`);
        }
         else {
             setError("Something went wrong while loading your profile.");
        }
        setUser(null); // Ensure user state is null on catch
      });
  }, []); // Empty dependency array means this runs once on mount

  // Display loading state
  if (!user && !error) { // Only show loading if no user data AND no error yet
    return <div className="account-page"><p>Loading user data...</p></div>;
  }

  // Display error state
  if (error) {
    // Optionally, still show some page structure even with an error
    return (
        <div className="account-page">
            <div className="account-container">
                <h2 className="profile-heading">Profile Information:</h2>
                <p className="error-message">{error}</p> {/* Style error messages */}
            </div>
        </div>
    );
  }

  // Display user profile if user data is available
  return (
    <div className="account-page">
      <div className="account-container">
        <h2 className="profile-heading">Profile Information:</h2>
        <div className="profile-card">
          <div className="profile-left">
            <img
              src={user.profileImage || '/defaultAvatar.png'} // Use default if no image
              alt="User Avatar"
              className="profile-avatar"
              // Add error handling for the image itself if needed
              onError={(e) => { e.target.onerror = null; e.target.src='/defaultAvatar.png'; }}
            />
          </div>
          <div className="profile-details">
            <ul>
              <li><strong>Display Name:</strong> {user.displayName || user.username}</li>
              <li><strong>Username:</strong> {user.username}</li> {/* Display username explicitly */}
              <li><strong>Email:</strong> {user.email}</li>
              <li><strong>Phone Number:</strong> {user.phoneNumber || 'N/A'}</li>
              <li><strong>University:</strong> {user.university || 'N/A'}</li>
              {/* Display user's stored timezone if available, otherwise fallback to browser's */}
              <li><strong>Time Zone:</strong> {user.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone}</li>
            </ul>
          </div>
        </div>

        {/* --- Added Assignment Dialog Structure --- */}
        <div className="assignment-dialog" style={{ marginTop: '30px', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
          <h2>Create Assignment</h2>
          {/*
            NOTE: The form below is just a placeholder structure.
            It currently lacks:
            1. Actual input fields (name, description, date, time, marks).
            2. State management for these input fields.
            3. An onSubmit handler function to process and send the data.
            4. Necessary context like 'courseName' which is not available here.
            Consider if assignment creation belongs on this page or within a specific course context.
          */}
          <form>
             <p style={{color: '#777'}}>Assignment form placeholder...</p>
             {/* Example Input (Needs state and handler): <input type="text" placeholder="Assignment Name" /> */}
             <button type="submit" disabled>Create (Disabled)</button> {/* Disabled as it's non-functional */}
          </form>
        </div>
        {/* --- End of Added Structure --- */}

      </div>
    </div>
  );
}

export default AccountPage;