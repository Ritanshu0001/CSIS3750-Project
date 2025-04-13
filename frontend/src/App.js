import React, {useState, useEffect} from "react";
import {Link} from "react-router-dom";

function App() {

  const [data, setData] = useState([{}])

  useEffect(() => {
    fetch("").then(
      res => res.json()
    ).then(
      data => {
        setData(data)
        console.log(data)
      }
    )
  }, [])

  function Home() {
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

      {/* 🌟 Moved below hero */}
      <div className="quote">
        “BrightBoard makes class organization 10x easier.” – Jane, CSIS 7777
      </div>
    </>
  );
}


function App() {
  return (
    <Router>
      <div className="app">
        {/* Navbar*/}
        <nav className="navbar">
          <div className="logo">
            🎓 <span>BrightBoard</span>
          </div>
          <ul className="nav-links">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/account">Account</Link></li>
            <li><Link to="/signin"><button className="signin-outline">Sign In</button></Link></li>
          </ul>
        </nav>

        {}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signin" element={<SignIn />} /> {/* ✅ RIGHT HERE */}
          <Route path="/verify" element={<Verification />} />
        </Routes>
      </div>
    </Router>
  );
}}

export default App