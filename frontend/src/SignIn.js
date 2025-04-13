import React from 'react';
import './App.css';
import { useNavigate } from 'react-router-dom';

function SignIn() {
  const navigate = useNavigate();

  const handleSignIn = (e) => {
    e.preventDefault();

    navigate('/verify');
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
        <input type="email" placeholder="Email:" />

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