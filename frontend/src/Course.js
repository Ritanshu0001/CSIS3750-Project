import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './Course.css';

export default function Course() {
  const { username, courseName } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Home');
  const [assignments, setAssignments] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [students, setStudents] = useState([]);
  const [newAnnouncement, setNewAnnouncement] = useState('');
  const [newTitle, setNewTitle] = useState('');

  const email = localStorage.getItem('email');
  const isTeacher = email && email.endsWith('@nova.edu');

  useEffect(() => {
    if (activeTab === 'Assignments' || activeTab === 'Grades') {
      fetch(`http://localhost:5000/test/assignments/${username}/${encodeURIComponent(courseName)}`)
        .then(res => res.json())
        .then(data => setAssignments(Array.isArray(data) ? data : []))
        .catch(err => console.error("Error fetching assignments:", err));
    }
  }, [activeTab, username, courseName]);

  useEffect(() => {
    if (activeTab === 'Announcements') {
      fetch(`http://localhost:5000/test/announcements/${username}/${encodeURIComponent(courseName)}`)
        .then(res => res.json())
        .then(data => setAnnouncements(Array.isArray(data) ? data : []))
        .catch(err => console.error("Error fetching announcements:", err));
    }
  }, [activeTab, username, courseName]);

  useEffect(() => {
    if (isTeacher && activeTab === 'Students') {
      fetch(`http://localhost:5000/test/teacherclasses/${encodeURIComponent(courseName)}/${username}`)
        .then(res => res.json())
        .then(data => setStudents(Array.isArray(data) ? data : []))
        .catch(err => console.error("Error fetching students:", err));
    }
  }, [activeTab, isTeacher, courseName, username]);

  const handleAnnouncementSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      username,
      courseName,
      message: newAnnouncement,
      title: newTitle
    };

    const res = await fetch('http://localhost:5000/test/announcements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const result = await res.json();
    if (res.ok) {
      setNewTitle('');
      setNewAnnouncement('');
      setAnnouncements(prev => [
        ...prev,
        { ...payload, createdAt: new Date().toISOString() }
      ]);
    } else {
      alert(result.error || "Failed to post announcement.");
    }
  };

  const handleViewStudent = (studentUsername) => {
    navigate(`/course/${courseName}/students/${studentUsername}`);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'Home':
        return (
          <>
            <h2>Welcome to {courseName}</h2>
            <ul>
              <li>My name is [Instructor Name] and I will be your instructor for this course.</li>
              <li><strong>Course Description</strong><br />
                An introduction to the principles and practices of [subject name], emphasizing critical thinking and practical application.
              </li>
              <li><strong>Getting Started</strong>
                <ul>
                  <li>Review the full course syllabus.</li>
                  <li>Check the weekly course schedule.</li>
                  <li>Obtain access to the required textbook.</li>
                </ul>
              </li>
              <li><strong>Text Info</strong><br />
                [Course Title], [Edition] by [Author(s)] - Published by [Publisher]
              </li>
            </ul>
          </>
        );

      case 'Assignments':
        return (
          <>
            <h2>Assignments</h2>
            <div className="assignment-box">
              {assignments.map((a, i) => (
                <div className="assignment-row" key={i}>
                  <span className="assignment-name">{a.name}</span>
                  <div className="assignment-meta">
                    <span className="assignment-due">
                      Due: {a.dueDate ? new Date(a.dueDate).toLocaleDateString() : 'N/A'}
                    </span>
                    <img
                      className="assignment-icon"
                      src={a.marksObtained ? "/checkmark.png" : "/circle1.png"}
                      alt={a.marksObtained ? "Completed" : "Pending"}
                    />
                  </div>
                </div>
              ))}
            </div>
          </>
        );

      case 'Announcements':
        return (
          <>
            <h2>Announcements for {courseName}</h2>
            <div className="announcement-wrapper">
              {isTeacher && (
                <form onSubmit={handleAnnouncementSubmit} className="announcement-form">
                  <input
                    type="text"
                    placeholder="Title"
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                    required
                  />
                  <textarea
                    placeholder="Write your announcement..."
                    value={newAnnouncement}
                    onChange={e => setNewAnnouncement(e.target.value)}
                    required
                  />
                  <button type="submit">Post Announcement</button>
                </form>
              )}
              {announcements.map((a, i) => (
                <div className="announcement-item" key={i}>
                  <strong>{a.title || 'Announcement'}</strong>
                  <p>{a.message}</p>
                  <small>
                    {a.createdAt && !isNaN(Date.parse(a.createdAt))
                      ? new Date(a.createdAt).toLocaleString()
                      : 'Date not available'}
                  </small>
                </div>
              ))}
            </div>
          </>
        );

      case 'Grades':
        return (
          <>
            <h2>Grades for {courseName}</h2>
            <div className="assignment-box">
              {assignments.length === 0 ? (
                <p>No grades available yet.</p>
              ) : (
                assignments.map((a, i) => (
                  <div className="assignment-row" key={i}>
                    <span className="assignment-name">{a.name}</span>
                    <span className="grade-tag">
                      {a.marksObtained !== undefined && a.marksObtained !== null
                        ? `${a.marksObtained} / ${a.totalMarks}`
                        : "Not Graded"}
                    </span>
                  </div>
                ))
              )}
            </div>
          </>
        );

      case 'Students':
        return (
          <div className="assignment-box">
            {students.length === 0 ? (
              <p>No students found for this course.</p>
            ) : (
              students.map((s, i) => (
                <div className="assignment-row" key={i}>
                 <span className="student-name">{s.firstName} {s.lastName}</span>
                 <button className="view-button" onClick={() => handleViewStudent(s.username)}>View</button>
                </div>
              ))
            )}
          </div>
        );

      case 'Syllabus':
        return (
          <>
            <h2>Course Syllabus</h2>
            <a
              href="/dummy.pdf"
              target="_blank"
              rel="noreferrer"
              style={{
                fontWeight: 'bold',
                fontSize: '18px',
                color: '#000',
                textDecoration: 'underline'
              }}
            >
              View Syllabus PDF
            </a>
          </>
        );

      default:
        return null;
    }
  };

  const tabs = ['Home', 'Assignments', 'Announcements', 'Grades', ...(isTeacher ? ['Students'] : []), 'Syllabus'];

  return (
    <div className="course-page">
      <div className="sidebar">
        <ul>
          {tabs.map(tab => (
            <li key={tab} onClick={() => setActiveTab(tab)} className={activeTab === tab ? 'active' : ''}>
              {tab}
            </li>
          ))}
        </ul>
        <img src="/books.png" alt="Books" />
      </div>

      <div className="course-content">
        {renderContent()}
      </div>

      {activeTab === 'Home' && (
        <div className="instructor-card">
          <img src="/professor.png" alt="Instructor" />
          <h3>Professor Muhammad</h3>
          <p>Canvas Inbox: Response time within 24–48 hours M–F.<br />
            Office Hours: By appointment<br /><br />
            Canvas Help:<br />
            • 1-844-865-2568<br />
            • Chat, Help Guides, Support Portal
          </p>
        </div>
      )}

      {activeTab === 'Assignments' && (
        <div className="instructor-card">
          <img src="/assignment.png" alt="Assignments" />
          <h3>Assignment Info</h3>
          <p>• Submit through Canvas<br />
            • Allowed formats: .docx, .pdf<br />
            • Late work may not be accepted
          </p>
        </div>
      )}

      {activeTab === 'Announcements' && (
        <div className="instructor-card">
          <img src="/professor.png" alt="Announcements" />
          <h3>Professor Muhammad</h3>
          <p>• Check announcements weekly<br />
            • Refresh for updates<br />
            • Email for urgent info
          </p>
        </div>
      )}

      {activeTab === 'Grades' && (
        <div className="instructor-card">
          <img src="/score.png" alt="Grades" />
          <h3>Your Overall Grade:</h3>
          <div style={{
            marginTop: '10px',
            backgroundColor: 'white',
            borderRadius: '20px',
            padding: '12px 24px',
            fontSize: '24px',
            fontWeight: 'bold',
            color: 'green',
            display: 'inline-block'
          }}>
            98.2%
          </div>
        </div>
      )}
    </div>
  );
}



