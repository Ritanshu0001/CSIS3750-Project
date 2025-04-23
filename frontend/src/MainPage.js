import React, { useEffect, useState } from 'react';
import './MainPage.css';
import { useNavigate } from 'react-router-dom';

function MainPage() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);

  const username = localStorage.getItem('username');

  useEffect(() => {
    if (!username) return;

    // Fetch all courses for the user
    fetch(`http://localhost:5000/test/courses/${username}`)
      .then((res) => res.json())
      .then(async (data) => {
        if (!Array.isArray(data)) {
          console.error("Courses data is not an array:", data);
          return setCourses([]);
        }

        // Fetch assignment grades for each course
        const updatedCourses = await Promise.all(
          data.map(async (course) => {
            try {
              const res = await fetch(`http://localhost:5000/test/assignments/${username}/${encodeURIComponent(course.courseName)}`);
              const assignments = await res.json();

              const totalScored = assignments.reduce((sum, a) => sum + (a.marksObtained || 0), 0);
              const totalPossible = assignments.reduce((sum, a) => sum + (a.totalMarks || 0), 0);
              const percentage = totalPossible ? ((totalScored / totalPossible) * 100).toFixed(1) : null;

              return { ...course, percentage };
            } catch (error) {
              console.error(`Error fetching assignments for ${course.courseName}:`, error);
              return { ...course, percentage: null };
            }
          })
        );

        setCourses(updatedCourses);
      })
      .catch((err) => console.error("Failed to fetch courses:", err));
  }, [username]);

  const handleClick = (course) => {
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
                
                {username !== 'teacher' && course.percentage && (
                  <div className="progress">{course.percentage}%</div>
                )}
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
