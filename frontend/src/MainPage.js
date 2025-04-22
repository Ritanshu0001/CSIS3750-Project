import React, { useEffect, useState } from 'react';
import './MainPage.css';
import { useNavigate } from 'react-router-dom';

function MainPage() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);

  const username = "jm6013"; // You can make this dynamic later via login

  useEffect(() => {
    fetch(`/test/courses/jm6013`)
      .then((res) => res.json())
      .then((data) => {
        setCourses(data);
        console.log("Fetched courses:", data);
      })
      .catch((err) => console.error("Failed to fetch courses:", err));
  }, []);

  const handleClick = (id) => {
    navigate(`/course/${id}`);
  };

  return (
    <div className="main-page">
      <div className="page-container">
        <div className="header-row">
          <img src="/nsu_logo.png" alt="NSU Florida Logo" className="nsu-logo" />
        </div>

        <div className="courses-grid">
          {courses.map((course, i) => (
            <div className="course-card" key={i} onClick={() => handleClick(course._id)}>
              <h3>{course.courseName}</h3>
              <ul>
                <li>{course.description}</li>
                <li>Discuss both views</li>
                <li>Sample answer</li>
              </ul>
              <img src="/class_img.png" alt="Course" className="course-image" />
              <div className="progress">81.5%</div>
            </div>
          ))}
        </div>
      </div>

      <footer className="footer">brightboard.edu</footer>
    </div>
  );
}

export default MainPage;