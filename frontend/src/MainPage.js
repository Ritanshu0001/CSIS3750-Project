import React, { useEffect } from 'react';
import './MainPage.css';

function MainPage() {
  useEffect(() => {
    const signInButton = document.querySelector('button');
    if (signInButton && signInButton.textContent === 'Sign In') {
      signInButton.textContent = 'Muhammad';
    }
  }, []);

  const courses = [
    { id: "CSIS 7777", title: "Task 2", details: ["Discuss both views", "Sample answer"], progress: "81.5%" },
    { id: "CSIS 0777", title: "Task 2", details: ["Discuss both views", "Sample answer"], progress: "81.5%" },
    { id: "CSIS 0077", title: "Task 2", details: ["Discuss both views", "Sample answer"], progress: "81.5%" },
    { id: "CSIS 0007", title: "Task 2", details: ["Discuss both views", "Sample answer"], progress: "81.5%" },
    { id: "CSIS 7000", title: "Task 2", details: ["Discuss both views", "Sample answer"], progress: "81.5%" },
    { id: "CSIS 7077", title: "Task 2", details: ["Discuss both views", "Sample answer"], progress: "81.5%" },
  ];

  return (
    <div className="main-page">
      <div className="page-container">
        <div className="header-row">
          <img src="/nsu_logo.png" alt="NSU Florida Logo" className="nsu-logo" />
        </div>

        <div className="courses-grid">
          {courses.map((course, i) => (
            <div className="course-card" key={i}>
              <h3>{course.id}</h3>
              <ul>
                <li>{course.title}</li>
                {course.details.map((item, idx) => <li key={idx}>{item}</li>)}
              </ul>
              <img src="/class_img.png" alt="Course" className="course-image" />
              <div className="progress">{course.progress}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ✅ Footer with BrightBoard.edu */}
      <footer className="footer">brightboard.edu</footer>
    </div>
  );
}

export default MainPage;
