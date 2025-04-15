import React, { useState } from 'react';
import './App.css';
import { useNavigate } from 'react-router-dom';

function SignIn({ setIsLoggedIn }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");

  const handleSignIn = (e) => {
    e.preventDefault();

    if (email.trim() === "jm6013") {
      setIsLoggedIn(true); // ✅ Trigger login state
      navigate('/verify');
    } else {
      alert("Invalid email. Please enter the correct email.");
    }
  };

  return (
    <div className="signin-wrapper">
      <div className="signin-left">
        <img src="/signin_img.png" alt="Login art" />
      </div>

      <div className="signin-right">
        <div className="signin-icon">🎓</div>
        <h2>Sign in</h2>

        <input type="text" placeholder="College name:" />
        <input 
          type="email" 
          placeholder="Email:" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <div className="password-field">
          <input type="password" placeholder="Password:" />
        </div>

        <button className="signin-filled" onClick={handleSignIn}>
          Sign in ➤
        </button>
      </div>
    </div>
  );
}

export default SignIn;
