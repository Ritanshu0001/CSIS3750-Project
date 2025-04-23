import React, { useEffect, useState } from 'react';
import './MainPage.css';
import { useNavigate } from 'react-router-dom';

function MainPage() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    const username = localStorage.getItem('username');
    if (!username) return;

    fetch(`/test/courses/${username}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setCourses(data);
        } else {
          console.error("Courses data is not an array:", data);
          setCourses([]);
        }
      })
      .catch((err) => console.error("Failed to fetch courses:", err));
  }, []);

  const handleClick = (course) => {
    const username = localStorage.getItem('username');
    const encodedCourseName = encodeURIComponent(course.courseName);
    navigate(`/course/${username}/${encodedCourseName}`);
  };

  return (
    <div className="main-page">
      <div className="page-container">
        <div className="header-row">
          <img src="/nsu_logo.png" alt="NSU Florida Logo" className="nsu-logo" />
          <h2>Courses You Are Enrolled In</h2>
        </div>

        <div className="courses-grid">
          {Array.isArray(courses) && courses.length > 0 ? (
            courses.map((course, i) => (
              <div className="course-card" key={i} onClick={() => handleClick(course)}>
                <h3>{course.courseName}</h3>
                <ul>
                  <li>{course.description}</li>
                  <li>Discuss both views</li>
                  <li>Sample answer</li>
                </ul>
                <img src="/class_img.png" alt="Course" className="course-image" />
                <div className="progress">81.5%</div>
              </div>
            ))
          ) : (
            <p>No courses found.</p>
          )}
        </div>
      </div>

      <footer className="footer">brightboard.edu</footer>
    </div>
  );
}

export default MainPage;