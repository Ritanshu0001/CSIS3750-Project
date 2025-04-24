import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './StudentProfile.css';

export default function StudentProfile() {
  const { studentUsername, courseName } = useParams();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [marks, setMarks] = useState({});

  useEffect(() => {
    fetch(`http://localhost:5000/test/assignments/${studentUsername}/${courseName}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setAssignments(data);
          const initialMarks = {};
          data.forEach(a => {
            initialMarks[a.name] = a.marksObtained ?? '';
          });
          setMarks(initialMarks);
        } else {
          console.error("Unexpected response:", data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching assignments:", err);
        setLoading(false);
      });
  }, [studentUsername, courseName]);

  const handleUpdateMarks = async (assignmentName) => {
    const newMarks = marks[assignmentName];
    try {
      const res = await fetch('http://localhost:5000/test/assignments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: studentUsername,
          courseName: courseName,
          assignmentName: assignmentName,
          marksObtained: Number(newMarks)
        })
      });

      if (res.ok) {
        alert("Marks updated successfully.");
        setAssignments(prev =>
          prev.map(a =>
            a.name === assignmentName ? { ...a, marksObtained: Number(newMarks) } : a
          )
        );
      } else {
        const error = await res.json();
        alert(error?.error || "Failed to update marks");
      }
    } catch (err) {
      console.error("Update error:", err);
      alert("Failed to update marks");
    }
  };

  return (
    <div className="student-profile-container">
      <h1>Assignments for {studentUsername} in {courseName}</h1>
      {loading ? (
        <p>Loading assignments...</p>
      ) : assignments.length === 0 ? (
        <p>No assignments found.</p>
      ) : (
        <div className="assignment-boxes">
          {assignments.map((a) => (
            <div className="assignment-box" key={a._id}>
              <div className="assignment-info">
                <strong>{a.name}</strong> - {a.description}
                <div className="assignment-marks">
                  (Marks: {a.totalMarks}, Obtained:{' '}
                  {a.marksObtained !== undefined && a.marksObtained !== null
                    ? a.marksObtained
                    : "Not Graded"})
                </div>
              </div>
              <div className="marks-update-section">
                <input
                  type="number"
                  value={marks[a.name]}
                  onChange={(e) =>
                    setMarks(prev => ({ ...prev, [a.name]: e.target.value }))
                  }
                />
                <button onClick={() => handleUpdateMarks(a.name)}>Update</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}





