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
  
  const [syllabusFile, setSyllabusFile] = useState(null);
  const [syllabusName, setSyllabusName] = useState('');
  

  const [newAssignment, setNewAssignment] = useState({
    name: '',
    description: '',
    totalMarks: '',
    dueDate: '',
    dueTime: '',
  });

  const email = localStorage.getItem('email');
  const isTeacher = email && email.endsWith('@nova.edu');

  
  useEffect(() => {
    if (!['Assignments', 'Grades'].includes(activeTab)) {
      setAssignments([]);
    }
    if (activeTab !== 'Announcements') {
      setAnnouncements([]);
    }
    if (activeTab !== 'Students') {
      setStudents([]);
    }
  }, [activeTab]);

  
  useEffect(() => {
    if (['Assignments', 'Grades'].includes(activeTab)) {
      fetch(
        `http://localhost:5000/test/assignments/${username}/${encodeURIComponent(
          courseName
        )}`
      )
        .then((res) => res.json())
        .then((data) => setAssignments(Array.isArray(data) ? data : []))
        .catch((err) => console.error('Error fetching assignments:', err));
    }
  }, [activeTab, username, courseName]);

  
  useEffect(() => {
    if (activeTab === 'Announcements') {
      const url = isTeacher
        ? `http://localhost:5000/test/announcements/course/${encodeURIComponent(
            courseName
          )}`
        : `http://localhost:5000/test/announcements/${username}/${encodeURIComponent(
            courseName
          )}`;

      fetch(url)
        .then((res) => res.json())
        .then((data) => setAnnouncements(Array.isArray(data) ? data : []))
        .catch((err) => console.error('Error fetching announcements:', err));
    }
  }, [activeTab, username, courseName, isTeacher]);

  
  useEffect(() => {
    if (isTeacher && activeTab === 'Students') {
      fetch(
        `http://localhost:5000/test/teacherclasses/${encodeURIComponent(
          courseName
        )}/${username}`
      )
        .then((res) => res.json())
        .then((data) => setStudents(Array.isArray(data) ? data : []))
        .catch((err) => console.error('Error fetching students:', err));
    }
  }, [activeTab, isTeacher, username, courseName]);

  
  const handleAnnouncementSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      username,
      courseName,
      message: newAnnouncement,
      title: newTitle,
    };

    try {
      const res = await fetch('http://localhost:5000/test/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await res.json();

      if (res.ok) {
        setNewTitle('');
        setNewAnnouncement('');
        setAnnouncements((prev) => [
          ...prev,
          { ...payload, createdAt: new Date().toISOString() },
        ]);
      } else {
        alert(result.error || 'Failed to post announcement.');
      }
    } catch (err) {
      alert('Error posting announcement: ' + err.message);
    }
  };

  
  const handleViewStudent = (studentUsername) => {
    navigate(`/course/${courseName}/students/${studentUsername}`);
  };

  
  const goToAddAssignmentTab = () => {
    setNewAssignment({
      name: '',
      description: '',
      totalMarks: '',
      dueDate: '',
      dueTime: '',
    });
    setActiveTab('AddAssignment');
  };

  
  const handleAssignmentChange = (e) => {
    const { name, value } = e.target;
    setNewAssignment((prev) => ({ ...prev, [name]: value }));
  };

  
  const handleSyllabusChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSyllabusFile(file);
      setSyllabusName(file.name);
    }
  };

  const handleSyllabusUpload = async (e) => {
    e.preventDefault();
    if (!syllabusFile) {
      return alert('Please choose a file first.');
    }

    const formData = new FormData();
    formData.append('courseName', courseName)
    formData.append('file', syllabusFile);

    try {
      const res = await fetch('http://localhost:5000/syllabus/upload', {
          method: 'POST',
          body: formData,
       });

      if (res.ok) {
        alert('✅ Syllabus uploaded successfully!');
        setSyllabusFile(null);
        setSyllabusName('');
      } else {
        const err = await res.json();
        alert('Upload failed: ' + (err.error || res.statusText));
      }
    } catch (e) {
      alert('Error uploading: ' + e.message);
    }
  };

  
  const renderContent = () => {
    switch (activeTab) {
      
      case 'Home':
        return (
          <>
            <h2>Welcome to {courseName}</h2>
            <ul>
              <li>My name is [Instructor Name] and I will be your instructor.</li>
              <li>
                <strong>Course Description</strong>
                <br />
                An introduction to the principles and practices of [subject name].
              </li>
              <li>
                <strong>Getting Started</strong>
                <ul>
                  <li>Review the full course syllabus.</li>
                  <li>Check the weekly course schedule.</li>
                  <li>Obtain access to the required textbook.</li>
                </ul>
              </li>
            </ul>
          </>
        );

      
      case 'Assignments':
        return (
          <>
            <div className="course-content">
              <h2>Assignments for {courseName}</h2>
              {isTeacher && (
                <button
                  className="floating-add-button"
                  onClick={goToAddAssignmentTab}
                >
                  ＋
                </button>
              )}
            </div>

            <div className="announcement-wrapper">
              {assignments.length === 0 ? (
                <p>No assignments posted yet.</p>
              ) : (
                assignments.map((a, i) => (
                  <div
                    key={a._id || i}
                    className="announcement-item assignment-item-row"
                    style={{ cursor: 'pointer' }}
                    onClick={() =>
                      navigate(
                        `/course/${encodeURIComponent(
                          username
                        )}/${encodeURIComponent(
                          courseName
                        )}/assignment/${encodeURIComponent(a.name)}`
                      )
                    }
                  >
                    <div className="assignment-left">
                      <strong>{a.name}</strong>
                    </div>
                    <div className="assignment-right">
                      <span>
                        Due:{' '}
                        {a.dueDate && a.dueDate.$date
                          ? new Date(a.dueDate.$date).toLocaleString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: true,
                            })
                          : 'Date not available'}
                      </span>
                      <img
                        src={
                          a.marksObtained != null ? '/checkmark.png' : '/circle1.png'
                        }
                        alt={a.marksObtained != null ? 'Completed' : 'Pending'}
                        style={{ width: 20, height: 20, marginLeft: 8 }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        );

      
      case 'AddAssignment':
        return (
          <div className="assignment-form">
            <h2>Create New Assignment</h2>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const { dueDate, dueTime, name, description, totalMarks } =
                  newAssignment;
                if (!dueDate || !dueTime) {
                  alert('Please select both a due date and a due time.');
                  return;
                }
                const dt = new Date(`${dueDate}T${dueTime}`);
                if (isNaN(dt.getTime())) {
                  alert('Invalid date/time selected.');
                  return;
                }
                const payload = {
                  name,
                  description,
                  totalMarks: Number(totalMarks),
                  dueDate: dt.toISOString(),
                  username,
                  courseName,
                };
                try {
                  const res = await fetch(
                    'http://localhost:5000/test/assignments',
                    {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(payload),
                    }
                  );
                  const result = await res.json();
                  if (res.ok) {
                    setActiveTab('Assignments');
                    setAssignments((prev) => [
                      ...prev,
                      { _id: result.insertedIds?.[0] || Date.now(), ...payload },
                    ]);
                  } else {
                    alert(result.error || 'Failed to create assignment.');
                  }
                } catch (err) {
                  alert('Error creating assignment: ' + err.message);
                }
              }}
            >
              <label>Name:</label>
              <input
                name="name"
                type="text"
                placeholder="Assignment Name"
                value={newAssignment.name}
                onChange={handleAssignmentChange}
                required
              />

              <label>Description:</label>
              <textarea
                name="description"
                placeholder="Description"
                value={newAssignment.description}
                onChange={handleAssignmentChange}
                required
              />

              <label>Total Marks:</label>
              <input
                name="totalMarks"
                type="number"
                placeholder="Total Marks"
                value={newAssignment.totalMarks}
                onChange={handleAssignmentChange}
                required
                min="0"
              />

              <div style={{ display: 'flex', gap: 10 }}>
                <div style={{ flex: 1 }}>
                  <label>Due Date:</label>
                  <input
                    name="dueDate"
                    type="date"
                    value={newAssignment.dueDate}
                    onChange={handleAssignmentChange}
                    required
                    style={{ width: '100%' }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label>Due Time:</label>
                  <input
                    name="dueTime"
                    type="time"
                    value={newAssignment.dueTime}
                    onChange={handleAssignmentChange}
                    required
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: 10,
                  marginTop: 20,
                }}
              >
                <button type="submit" className="submit-btn">
                  Create Assignment
                </button>
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setActiveTab('Assignments')}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        );

      
      case 'Announcements':
        return (
          <>
            <div className="announcement-form-box">
              <h2>Announcements for {courseName}</h2>
              {isTeacher && (
                <form
                  onSubmit={handleAnnouncementSubmit}
                  className="announcement-form"
                >
                  <input
                    type="text"
                    placeholder="Title"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    required
                  />
                  <textarea
                    placeholder="Write your announcement..."
                    value={newAnnouncement}
                    onChange={(e) => setNewAnnouncement(e.target.value)}
                    required
                  />
                  <button type="submit">Post Announcement</button>
                </form>
              )}
            </div>
            <div className="announcement-posts">
              {announcements.length === 0 ? (
                <p style={{ marginTop: 20, color: '#333' }}>No announcements posted yet.</p>
              ) : (
                [...announcements]
                  .reverse()
                  .map((a, i) => (
                    <div className="announcement-item" key={i}>
                      <strong>{a.title || 'Announcement'}</strong>
                      <p>{a.message}</p>
                      <small>
                        {a.createdAt ? new Date(a.createdAt).toLocaleString() : '—'}
                      </small>
                    </div>
                  ))
              )}
            </div>
          </>
        );

      
      case 'Grades':
        const totalScored = assignments.reduce((sum, a) => sum + (a.marksObtained || 0), 0);
        const totalPossible = assignments.reduce((sum, a) => sum + (a.totalMarks || 0), 0);
        const percent = totalPossible ? ((totalScored / totalPossible) * 100).toFixed(1) : '0.0';

        return (
          <>
            <h2>Grades for {courseName}</h2>
            <div className="announcement-wrapper">
              {assignments.length === 0 ? (
                <p>No grades available yet.</p>
              ) : (
                assignments.map((a, i) => (
                  <div
                    key={a._id || i}
                    className="announcement-item assignment-item-row"
                  >
                    <div className="assignment-left">
                      <strong>{a.name}</strong>
                    </div>
                    <div className="assignment-right">
                      <span>
                        {a.marksObtained != null ? a.marksObtained : '–'} /{' '}
                        {a.totalMarks != null ? a.totalMarks : '–'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        );

      
      case 'Students':
        return (
          <>
            <h2>Students in {courseName}</h2>

            <div className="announcement-wrapper">
              {students.length === 0 ? (
                <p>No students found for this course.</p>
              ) : (
                students.map((s, i) => (
                  <div
                    key={s.username || i}
                    className="announcement-item assignment-item-row"
                  >
                    <div className="assignment-left">
                      <span>{s.firstName} {s.lastName}</span>
                    </div>
                    <div className="assignment-right">
                      <button
                        className="view-profile-button"
                        onClick={() => handleViewStudent(s.username)}
                      >
                        View Profile
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        );

      
      case 'Syllabus':
        return (
          <>
            <h2>Course Syllabus</h2>

            {isTeacher && (
              <form
                className="syllabus-form"
                onSubmit={handleSyllabusUpload}   
              >
                <input
                  type="file"
                  onChange={handleSyllabusChange}  
                />
                <button type="submit" className="submit-btn">
                  Upload Syllabus
                </button>
              </form>
            )}

            <a
              href={`http://localhost:5000/syllabus/download/${encodeURIComponent(
                courseName
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="download-link"
            >
              📄 Download Syllabus
            </a>
          </>
        );

      
      default:
        return <h2>Welcome to {courseName}</h2>;
    }
  };

  const tabs = [
    'Home',
    'Assignments',
    'Announcements',
    ...(isTeacher ? ['Students'] : ['Grades']),
    'Syllabus',
  ];

  return (
    <div className="course-page">
      <nav className="sidebar">
        <ul>
          {tabs.map((t) => (
            <li
              key={t}
              className={activeTab === t ? 'active' : ''}
              onClick={() => setActiveTab(t)}
            >
              {t}
            </li>
          ))}
        </ul>
        <img src="/books.png" alt="Books" className="sidebar-image" />
      </nav>

      <main className="course-content">{renderContent()}</main>

      
      {activeTab === 'Home' && (
        <div className="instructor-card">
          <img src="/professor.png" alt="Instructor" />
          <h3>Professor </h3>
          <p>
            Email Inbox: Response time within 24–48 hours M–F.
            <br />
            Office Hours: By appointment
            <br />
            <br />
            BrighBoard Help:
            <br />• 1-844-865-2568
            <br />
            • Chat, Help Guides, Support Portal
          </p>
        </div>
      )}
      {(activeTab === 'Assignments' || activeTab === 'AddAssignment') && (
        <div className="instructor-card">
          <img src="/assignment.png" alt="Assignments" />
          <h3>Assignment Info</h3>
          <p>
            • Submit by clicking n the assignment 
            <br />
            • Allowed any format
            <br />
            • Late work may not be accepted
          </p>
        </div>
      )}
      {activeTab === 'Announcements' && (
        <div className="instructor-card">
          <img src="/professor.png" alt="Announcements" />
          <h3>Professor </h3>
          <p>
            • Check announcements weekly
            <br />
            • Refresh for updates
            <br />
            • Email for urgent info
          </p>
        </div>
      )}
      {activeTab === 'Grades' && !isTeacher && (() => {
        const totalScored = assignments.reduce((sum, a) => sum + (a.marksObtained||0), 0);
        const totalPossible = assignments.reduce((sum, a) => sum + (a.totalMarks||0), 0);
        const percent = totalPossible
          ? ((totalScored/totalPossible)*100).toFixed(1)
          : '0.0';

        return (
          <div className="instructor-card grades-summary">
            <img src="/score.png" alt="Grades" />
            <h3>Your Overall Grade:</h3>
            <div className="grade-percentage-box">{percent}%</div>
          </div>
        );
      })()}
      {activeTab === 'Students' && isTeacher && (
        <div className="instructor-card">
          <img src="/students_icon.png" alt="Student Roster" />
          <h3>Student Roster</h3>
          <p>
            • List of enrolled students.
            <br />
            • Click 'View Profile' for details.
            <br />
            • Use for grading.
          </p>
        </div>
      )}
      {activeTab === 'Syllabus' && (
        <div className="instructor-card">
          <img src="/syllabus_icon.png" alt="Syllabus Info" />
          <h3>Syllabus Details</h3>
          <p>
            • Contains course policies.
            <br />
            • Includes grading breakdown.
            <br />
            • Refer to it for course structure.
          </p>
        </div>
      )}
    </div>
  );
}
