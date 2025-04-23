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


function Navbar({ isLoggedIn, setIsLoggedIn }) {
  const location = useLocation();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const firstName = localStorage.getItem('firstName');
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
    localStorage.removeItem('firstName');
    localStorage.removeItem('student_id');
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
            {localStorage.getItem('username') !== 'teacher' && (
              <li><Link to="/todo">To-Do</Link></li>
            )}
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
        <Route path="/" element={<SignIn setIsLoggedIn={setIsLoggedIn} />} />
        <Route path="/signin" element={<SignIn setIsLoggedIn={setIsLoggedIn} />} />
        <Route path="/verify" element={<Verification />} />
        <Route path="/main" element={<MainPage />} />
        <Route path="/account" element={<AccountPage />} />
        <Route path="/course/:username/:courseName" element={<Course />} />
        <Route path="/course/:courseName/students/:studentUsername" element={<StudentProfile />} />
        <Route path="/todo" element={<ToDo />} />
      </Routes>
    </Router>
  );
}

export default App;
