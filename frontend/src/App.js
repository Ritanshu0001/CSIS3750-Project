import './App.css';
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import SignIn from './SignIn';
import Verification from './Verification';
import MainPage from './MainPage';
import AccountPage from './AccountPage';
import ToDo from './ToDo';
import Course from './Course';

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

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  return (
    <Router>
      {/* ✅ Navbar always visible */}
      <nav className="navbar">
        <div className="logo">
          <img src="/logo.png" alt="Logo" style={{ height: "32px" }} />
          <Link to="/" style={{ textDecoration: 'none', color: 'black' }}>
            BrightBoard
          </Link>
        </div>
        <ul className="nav-links">
          <li><Link to="/main">Home</Link></li>
          <li><Link to="/account">Account</Link></li>
          <li><Link to="/todo">To Do</Link></li>
        </ul>
      </nav>

      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signin" element={<SignIn setAuth={setIsAuthenticated} />} />
        <Route path="/verification" element={
          isAuthenticated ? (
            <Verification setVerified={setIsVerified} />
          ) : (
            <Navigate to="/signin" />
          )
        } />
        <Route path="/main" element={
          isAuthenticated && isVerified ? (
            <MainPage />
          ) : (
            <Navigate to="/signin" />
          )
        } />
        <Route path="/account" element={
          isAuthenticated && isVerified ? (
            <AccountPage />
          ) : (
            <Navigate to="/signin" />
          )
        } />
        <Route path="/todo" element={
          isAuthenticated && isVerified ? (
            <ToDo />
          ) : (
            <Navigate to="/signin" />
          )
        } />
        <Route path="/course/:id" element={
          isAuthenticated && isVerified ? (
            <Course />
          ) : (
            <Navigate to="/signin" />
          )
        } />
      </Routes>
    </Router>
  );
}

export default App;
