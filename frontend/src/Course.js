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

  // Fetch Assignments
  useEffect(() => {
    if (activeTab === 'Assignments') {
      fetch(`http://localhost:5000/test/assignments/${username}/${encodeURIComponent(courseName)}`)
        .then(res => res.json())
        .then(data => setAssignments(Array.isArray(data) ? data : []))
        .catch(err => console.error("Error fetching assignments:", err));
    }
  }, [activeTab, username, courseName]);

  // Fetch Announcements
  useEffect(() => {
    if (activeTab === 'Announcements') {
      fetch(`http://localhost:5000/test/announcements/${username}/${encodeURIComponent(courseName)}`)
        .then(res => res.json())
        .then(data => setAnnouncements(Array.isArray(data) ? data : []))
        .catch(err => console.error("Error fetching announcements:", err));
    }
  }, [activeTab, username, courseName]);

  // Fetch Students for Teachers
  useEffect(() => {
    if (isTeacher && activeTab === 'Students') {
      fetch(`http://localhost:5000/test/teacherclasses/${encodeURIComponent(courseName)}/${username}`)
        .then(res => res.json())
        .then(data => setStudents(Array.isArray(data) ? data : []))
        .catch(err => console.error("Error fetching students:", err));
    }
  }, [activeTab, isTeacher, courseName, username]);

  // Submit New Announcement
  const handleAnnouncementSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      username, // Must match Flask
      courseName,
      message: newAnnouncement,
      title: newTitle // Optional (if backend stores it)
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
      setAnnouncements(prev => [...prev, {
        ...payload,
        createdAt: new Date().toISOString()
      }]);
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
        return <p>Welcome to <strong>{courseName}</strong>. Use the tabs to explore course resources.</p>;

      case 'Assignments':
        return (
          <div className="assignment-box">
            {assignments.map((a, i) => (
              <div className="assignment-row" key={i}>
                <span>{a.name}</span>
                <span>Due: {new Date(a.dueDate).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        );

      case 'Announcements':
        return (
          <div className="assignment-box">
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
              <div className="assignment-row" key={i}>
                <strong>{a.title}</strong>
                <p>{a.message}</p>
                <small>{a.createdAt ? new Date(a.createdAt).toLocaleDateString() : ''}</small>
              </div>
            ))}
          </div>
        );

      case 'Grades':
        return <p>Grades coming soon...</p>;

      case 'Students':
        return (
          <div className="assignment-box">
            {students.length === 0 ? (
              <p>No students found for this course.</p>
            ) : (
              students.map((s, i) => (
                <div className="assignment-row" key={i}>
                  <span>{s.firstName} {s.lastName}</span>
                  <button onClick={() => handleViewStudent(s.username)}>View</button>
                </div>
              ))
            )}
          </div>
        );

      case 'Syllabus':
        return <a href="/dummy.pdf" target="_blank" rel="noreferrer">View Syllabus</a>;

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
    </div>
  );
}

