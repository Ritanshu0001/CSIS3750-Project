// App.js
import './App.css';
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import SignIn from './SignIn';
import Verification from './Verification';
import MainPage from './MainPage';
import AccountPage from './AccountPage';
import Course from './Course';
import StudentProfile from './StudentProfile';

function Navbar({ isLoggedIn }) {
  const location = useLocation();
  const hideLinks = ['/', '/signin', '/verify'];
  const shouldHideLinks = hideLinks.includes(location.pathname);

  return (
    <nav className="navbar">
      <div className="logo">🎓 <span>BrightBoard</span></div>
      <ul className="nav-links">
        {!shouldHideLinks && (
          <>
            <li><Link to="/main">Home</Link></li>
            <li><Link to="/account">Account</Link></li>
          </>
        )}
        <li>
          {shouldHideLinks ? (
            <Link to="/signin"><button className="signin-outline">Sign In</button></Link>
          ) : (
            isLoggedIn ? (
              <button className="signin-outline">{localStorage.getItem('username')}</button>
            ) : (
              <Link to="/signin"><button className="signin-outline">Sign In</button></Link>
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
        <Route path="/" element={<SignIn setIsLoggedIn={setIsLoggedIn} />} />
        <Route path="/signin" element={<SignIn setIsLoggedIn={setIsLoggedIn} />} />
        <Route path="/verify" element={<Verification />} />
        <Route path="/main" element={<MainPage />} />
        <Route path="/account" element={<AccountPage />} />
        <Route path="/course/:username/:courseName" element={<Course />} />
        <Route path="/course/:courseName/students/:studentUsername" element={<StudentProfile />} />
      </Routes>
    </Router>
  );
}

export default App;
