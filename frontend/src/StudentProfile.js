import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

export default function StudentProfile() {
  const { studentUsername, courseName } = useParams();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`http://localhost:5000/test/student-assignments/${studentUsername}/${courseName}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setAssignments(data);
        } else {
          console.error("Unexpected response:", data);
          setAssignments([]);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching assignments:", err);
        setAssignments([]);
        setLoading(false);
      });
  }, [studentUsername, courseName]);

  return (
    <div style={{ padding: '40px' }}>
      <h1>Assignments for {studentUsername} in {courseName}</h1>
      {loading ? (
        <p>Loading assignments...</p>
      ) : assignments.length === 0 ? (
        <p>No assignments found.</p>
      ) : (
        <ul>
          {assignments.map((a, index) => (
            <li key={index}>
              <strong>{a.name}</strong> - {a.description} (Marks: {a.totalMarks})
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

