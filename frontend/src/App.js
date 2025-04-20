import './App.css';
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import SignIn from './SignIn';
import Verification from './Verification';
import MainPage from './MainPage';
import AccountPage from './AccountPage';

function LandingPage() {
  return (
    <>
      <div className="hero">
        <div className="hero-left">
          <img src="/homepage_img.png" alt="BrightBoard" />
        </div>
        <div className="hero-right">
          <h1>Welcome to <br /> <strong>BrightBoard.</strong></h1>
          <p>BrightBoard is an enhanced version of Canvas with improved features and better collaboration tools.</p>
          <Link to="/signin">
            <button className="signin-filled">Sign in ➤</button>
          </Link>
        </div>
      </div>
      <div className="quote">
        “BrightBoard makes class organization 10x easier.” – Jane, CSIS 7777
      </div>
    </>
  );
}

// ✅ Navbar updated to always show "Sign In" on specific pages
function Navbar({ isLoggedIn }) {
  const location = useLocation();
  const hideLinks = ['/', '/signin', '/verify'];
  const shouldHideLinks = hideLinks.includes(location.pathname);

  return (
    <nav className="navbar">
      <div className="logo">
        🎓 <span>BrightBoard</span>
      </div>
      <ul className="nav-links">
        {!shouldHideLinks && (
          <>
            <li><Link to="/main">Home</Link></li>
            <li><Link to="/account">Account</Link></li>
          </>
        )}
        <li>
          {shouldHideLinks ? (
            <Link to="/signin">
              <button className="signin-outline">Sign In</button>
            </Link>
          ) : (
            isLoggedIn ? (
              <button className="signin-outline">Muhammad</button>
            ) : (
              <Link to="/signin">
                <button className="signin-outline">Sign In</button>
              </Link>
            )
          )}
        </li>
      </ul>
    </nav>
  );
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <Router>
      <Navbar isLoggedIn={isLoggedIn} />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signin" element={<SignIn setIsLoggedIn={setIsLoggedIn} />} />
        <Route path="/verify" element={<Verification />} />
        <Route path="/main" element={<MainPage />} />
        <Route path="/account" element={<AccountPage />} />
      </Routes>
    </Router>
  );
}

export default App;