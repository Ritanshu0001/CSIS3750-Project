import './App.css';
import React, { useState, useEffect, useRef } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useLocation,
  useNavigate,
} from 'react-router-dom';

import SignIn from './SignIn';
import Verification from './Verification';
import MainPage from './MainPage';
import AccountPage from './AccountPage';
import Course from './Course';
import StudentProfile from './StudentProfile';
import ToDo from "./ToDo";
import Assignment from "./Assignment"; // 

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

function Navbar({ isLoggedIn, setIsLoggedIn }) {
  const location = useLocation();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const firstName = localStorage.getItem('firstName');
  const username = localStorage.getItem('username') || '';
  const isTeacher = ['teacher', 't0'].includes(username); 
  const hideLinks = ['/', '/signin', '/verify'];
  const shouldHideLinks = hideLinks.includes(location.pathname);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    navigate('/signin');
  };

  return (
    <nav className="navbar">
      <div className="logo">🎓 <span>BrightBoard</span></div>
      <ul className="nav-links">
        {!shouldHideLinks && (
          <>
            <li><Link to="/main">Home</Link></li>
            {!isTeacher && <li><Link to="/todo">To-Do</Link></li>}
            <li><Link to="/account">Account</Link></li>
          </>
        )}
        <li ref={dropdownRef}>
          {shouldHideLinks ? (
            <Link to="/signin"><button className="signin-outline">Sign In</button></Link>
          ) : (
            isLoggedIn ? (
              <div className="dropdown-wrapper">
                <button
                  className="signin-outline"
                  onClick={() => setDropdownOpen(prev => !prev)}
                >
                  {firstName}
                </button>
                {dropdownOpen && (
                  <div className="dropdown-menu">
                    <button onClick={handleLogout}>Logout</button>
                  </div>
                )}
              </div>
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
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('username'));

  return (
    <Router>
      <Navbar isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />

      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signin" element={<SignIn setIsLoggedIn={setIsLoggedIn} />} />
        <Route path="/verify" element={<Verification />} />
        <Route path="/main" element={<MainPage />} />
        <Route path="/account" element={<AccountPage />} />
        <Route path="/course/:username/:courseName" element={<Course />} />
        <Route path="/course/:courseName/students/:studentUsername" element={<StudentProfile />} />
        
        
        <Route path="/course/:username/:courseName/assignment/:assignmentName" element={<Assignment />} />

        
        <Route
          path="/todo"
          element={
            ['teacher', 't0'].includes(localStorage.getItem('username')) ? (
              <div style={{ padding: "2rem", fontSize: "1.2rem" }}>Access Denied</div>
            ) : (
              <ToDo />
            )
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
