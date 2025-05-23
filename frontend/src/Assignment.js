import './Assignment.css';
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';

export default function Assignment() {
  const { username, courseName, assignmentName } = useParams();
  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState(null);
  const [submissions, setSubmissions] = useState([]);

  const email = localStorage.getItem('email');
  const loggedInUsername = localStorage.getItem('username');
  const isTeacher = email && email.endsWith('@nova.edu');

  useEffect(() => {
    const targetUsername = loggedInUsername; 
    fetch(`http://localhost:5000/test/assignments/${targetUsername}/${encodeURIComponent(courseName)}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const match = data.find(a => a.name === assignmentName);
          setAssignment(match || null);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching assignment:", err);
        setLoading(false);
      });
  }, [loggedInUsername, courseName, assignmentName]);

  useEffect(() => {
    if (isTeacher) {
      fetch(`http://localhost:5000/test/assignments/submissions/${encodeURIComponent(courseName)}/${assignmentName}`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setSubmissions(data);
          }
        })
        .catch(err => console.error("Error fetching submissions:", err));
    }
  }, [isTeacher, courseName, assignmentName]);

  const handleUpload = async () => {
    if (!file) return alert("Please select a file first.");
    const formData = new FormData();
    formData.append("file", file);
    formData.append("username", loggedInUsername);
    formData.append("courseName", courseName);
    formData.append("assignmentName", assignmentName);

    try {
      const res = await fetch("http://localhost:5000/test/assignments/upload", {
        method: "POST",
        body: formData
      });

      const result = await res.json();
      if (res.ok) {
        alert("Submitted!");
        setAssignment(prev => ({ ...prev, uploadedFileName: file.name }));
      } else {
        alert("Submission failed: " + result.error);
      }
    } catch (err) {
      alert("Upload error: " + err.message);
    }
  };

  const handleDownload = async (studentUsername) => {
    try {
      const res = await fetch(`http://localhost:5000/test/assignments/download/${studentUsername}/${encodeURIComponent(courseName)}/${assignmentName}`);
      const data = await res.json();
      if (res.ok && data.fileData) {
        const link = document.createElement('a');
        link.href = `data:application/octet-stream;base64,${data.fileData}`;
        link.download = data.filename || `${studentUsername}_submission`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        alert("Download failed.");
      }
    } catch (err) {
      alert("Download failed: " + err.message);
    }
  };

  const formattedDate = assignment?.dueDate
    ? new Date(assignment.dueDate.$date || assignment.dueDate).toLocaleString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: true,
      })
    : 'No due date';

  if (loading) return <div className="assignment-box">Loading...</div>;
  if (!assignment) return <div className="assignment-box">Assignment not found.</div>;

  return (
    <div className="assignment-box">
      <div className="assignment-details">
        <h2>{assignment.name}</h2>
        <p><strong>Description:</strong> {assignment.description}</p>
        <p><strong>Due:</strong> {formattedDate}</p>
        <p><strong>Total Marks:</strong> {assignment.totalMarks}</p>
        <p><strong>Created By:</strong> {assignment.username}</p>
        <p><strong>Course:</strong> {assignment.courseName}</p>
      </div>

      {!isTeacher && (
        <div className="upload-section">
          <input type="file" onChange={(e) => setFile(e.target.files[0])} />
          <button className="upload-btn" onClick={handleUpload}>📤 Submit Assignment</button>
        </div>
      )}

      {isTeacher && submissions.length > 0 && (
        <div className="submissions">
          <h3>Student Submissions</h3>
          {submissions.map((s, i) => (
            <div key={i} className="submission-item vertical">
              <div className="submission-info">
                <strong>{s.firstName} {s.lastName}</strong><br />
                <em>{s.filename}</em>
              </div>
              <button className="download-btn" onClick={() => handleDownload(s.username)}>⬇️ Download</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
