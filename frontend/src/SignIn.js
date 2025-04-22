import React, { useState } from 'react';
import './App.css';
import { useNavigate } from 'react-router-dom';

function SignIn({ setIsLoggedIn }) {
  const navigate = useNavigate();
  const [university, setUniversity] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ university, email, password })
      });
      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('username', 'jm6013');
        setIsLoggedIn(true);
        navigate('/verify');
      } else {
        alert(data.error || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      console.log(err);
      alert('Server error. Please try again later.');
    } finally {
      setLoading(false);
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

        <form onSubmit={handleSignIn}>
          <input
            type="text"
            placeholder="University name:"
            value={university}
            onChange={(e) => setUniversity(e.target.value)}
            required
          />

          <input
            type="email"
            placeholder="Email:"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <div className="password-field">
            <input
              type="password"
              placeholder="Password:"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            className="signin-filled"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Signing in…' : 'Sign in ➤'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default SignIn;
