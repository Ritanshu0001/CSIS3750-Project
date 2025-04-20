import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Verification.css";

function Verification() {
  const [code, setCode] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Entered code:", code);
    navigate("/main");
  };

  return (
    <div className="verification-page">

      <div className="img-wrapper left-img-wrapper">
        <img src="/verify_1.png" alt="Left illustration" className="side-img" />
      </div>

    
      <div className="center-content">
        <div className="logo-icon">🎓</div>
        <h2>Verification</h2>
        <p>A code has been sent to your email, please enter it.</p>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Code:"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="code-input"
            required
          />
          <div className="btn-container">
            <button type="submit" className="verify-btn">
              <strong>Verify</strong> <span className="arrow">➤</span>
            </button>
          </div>
        </form>
      </div>

      
      <div className="img-wrapper right-img-wrapper">
        <img src="/verify_2.png" alt="Right illustration" className="side-img" />
      </div>
    </div>
  );
}

export default Verification;
