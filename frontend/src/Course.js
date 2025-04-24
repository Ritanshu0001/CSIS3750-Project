import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './Course.css'; // Ensure styles for .assignment-form are present if needed

export default function Course() {
  const { username, courseName } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Home');
  const [assignments, setAssignments] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [students, setStudents] = useState([]);
  const [newAnnouncement, setNewAnnouncement] = useState('');
  const [newTitle, setNewTitle] = useState('');

  // Updated state to include dueTime for the new assignment form
  const [newAssignment, setNewAssignment] = useState({
    name: '',
    description: '',
    totalMarks: '',
    dueDate: '',
    dueTime: '', // Added dueTime field
  });

  const email = localStorage.getItem('email');
  const isTeacher = email && email.endsWith('@nova.edu');

  // Fetch assignments when Assignments or Grades tab is active
  useEffect(() => {
    if (activeTab === 'Assignments' || activeTab === 'Grades') {
      fetch(`http://localhost:5000/test/assignments/${username}/${encodeURIComponent(courseName)}`)
        .then(res => res.json())
        .then(data => setAssignments(Array.isArray(data) ? data : []))
        .catch(err => console.error("Error fetching assignments:", err));
    }
  }, [activeTab, username, courseName]);

  // Fetch announcements when Announcements tab is active
  useEffect(() => {
    if (activeTab === 'Announcements') {
      const isTeacher = email && email.endsWith('@nova.edu');
      const url = isTeacher
        ? `http://localhost:5000/test/announcements/course/${encodeURIComponent(courseName)}`
        : `http://localhost:5000/test/announcements/${username}/${encodeURIComponent(courseName)}`;

      fetch(url)
        .then(res => res.json())
        .then(data => setAnnouncements(Array.isArray(data) ? data : []))
        .catch(err => console.error("Error fetching announcements:", err));
    }
  }, [activeTab, courseName, username]);


  // Fetch students when Students tab is active (for teachers)
  useEffect(() => {
    if (isTeacher && activeTab === 'Students') {
      fetch(`http://localhost:5000/test/teacherclasses/${encodeURIComponent(courseName)}/${username}`)
        .then(res => res.json())
        .then(data => setStudents(Array.isArray(data) ? data : []))
        .catch(err => console.error("Error fetching students:", err));
    }
  }, [activeTab, isTeacher, courseName, username]);

  // Handle submitting a new announcement
  const handleAnnouncementSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      username, // From useParams
      courseName, // From useParams
      message: newAnnouncement,
      title: newTitle
    };

    try {
        const res = await fetch('http://localhost:5000/test/announcements', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const result = await res.json();
        if (res.ok) {
            setNewTitle('');
            setNewAnnouncement('');
            setAnnouncements(prev => [...prev, { ...payload, createdAt: new Date().toISOString() }]);
        } else {
            alert(result.error || "Failed to post announcement.");
        }
    } catch (err) {
        alert("Error posting announcement: " + err.message);
    }
  };

  // Navigate to view a specific student's profile
  const handleViewStudent = (studentUsername) => {
    navigate(`/course/${courseName}/students/${studentUsername}`);
  };

  // Updated function to reset dueTime as well when navigating to the Add Assignment tab
  const goToAddAssignmentTab = () => {
      setNewAssignment({ name: '', description: '', totalMarks: '', dueDate: '', dueTime: '' }); // Reset all fields
      setActiveTab('AddAssignment');
  };

  // Generic handler for controlled form inputs
  const handleAssignmentChange = (e) => {
    const { name, value } = e.target;
    setNewAssignment(prev => ({ ...prev, [name]: value }));
  };


  // Render content based on the active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'Home':
        return (
          <>
            <h2>Welcome to {courseName}</h2>
            {/* ... Home content ... */}
              <ul>
                <li>My name is [Instructor Name] and I will be your instructor for this course.</li>
                <li><strong>Course Description</strong><br />An introduction to the principles and practices of [subject name].</li>
                <li><strong>Getting Started</strong><ul>
                    <li>Review the full course syllabus.</li>
                    <li>Check the weekly course schedule.</li>
                    <li>Obtain access to the required textbook.</li>
                </ul></li>
              </ul>
          </>
        );

      case 'Assignments':
          return (
            <>
              <div className="course-content">
                <h2>Assignments for {courseName}</h2>
                {/* assignment list here */}
                {isTeacher && (
                  <button className="floating-add-button" onClick={goToAddAssignmentTab}>
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
                          `/course/${encodeURIComponent(username)}/${encodeURIComponent(courseName)}/assignment/${encodeURIComponent(a.name)}`
                        )
                      }
                    >
                      <div className="assignment-left">
                        <strong>{a.name}</strong>
                      </div>
                      <div className="assignment-right">
                        <span>
                          Due:{" "}
                          {a.dueDate && a.dueDate.$date
                            ? new Date(a.dueDate.$date).toLocaleString("en-US", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: true,
                              })
                            : "Date not available"}
                        </span>
                        <img
                          style={{ width: "20px", height: "20px", marginLeft: "10px" }}
                          src={
                            a.marksObtained !== undefined
                              ? "/checkmark.png"
                              : "/circle1.png"
                          }
                          alt={
                            a.marksObtained !== undefined ? "Completed" : "Pending"
                          }
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
                  const { dueDate, dueTime, name, description, totalMarks } = newAssignment;

                  if (!dueDate || !dueTime) {
                    alert("Please select both a due date and a due time.");
                    return;
                  }

                  const combinedDateTime = new Date(`${dueDate}T${dueTime}`);
                  if (isNaN(combinedDateTime.getTime())) {
                    alert("Invalid date or time selected. Please check your inputs.");
                    return;
                  }

                  const isoDueDate = combinedDateTime.toISOString();
                  const payload = {
                    name,
                    description,
                    totalMarks: Number(totalMarks),
                    dueDate: isoDueDate,
                    username,
                    courseName,
                  };

                  try {
                    const res = await fetch("http://localhost:5000/test/assignments", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(payload),
                    });

                    const result = await res.json();
                    if (res.ok) {
                      alert("Assignment created successfully!");
                      setActiveTab("Assignments");
                      if (result.insertedIds && Array.isArray(result.insertedIds)) {
                        setAssignments((prev) => [
                          ...prev,
                          ...result.insertedIds.map((id) => ({ _id: id, ...payload })),
                        ]);
                      } else {
                        setAssignments((prev) => [
                          ...prev,
                          { _id: Date.now(), ...payload },
                        ]);
                      }
                    } else {
                      alert(result.error || "Failed to create assignment.");
                    }
                  } catch (err) {
                    alert("Error creating assignment: " + err.message);
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

                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  <div style={{ flex: 1 }}>
                    <label htmlFor="dueDate">Due Date:</label>
                    <input
                      id="dueDate"
                      name="dueDate"
                      type="date"
                      value={newAssignment.dueDate}
                      onChange={handleAssignmentChange}
                      required
                      style={{ width: "100%" }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label htmlFor="dueTime">Due Time:</label>
                    <input
                      id="dueTime"
                      name="dueTime"
                      type="time"
                      value={newAssignment.dueTime}
                      onChange={handleAssignmentChange}
                      required
                      style={{ width: "100%" }}
                    />
                  </div>
                </div>

                <div className="form-actions" style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "20px" }}>
                <button type="submit" className="submit-btn">Create Assignment</button>
                <button type="button" className="cancel-btn" onClick={() => setActiveTab("Assignments")}>
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
              </div>

              <div className="announcement-posts">
                {announcements.length === 0 ? (
                  <p style={{ marginTop: '20px', color: '#333' }}>No announcements posted yet.</p>
                ) : (
                  [...announcements].reverse().map((a, i) => (
                    <div className="announcement-item" key={i}>
                      <strong>{a.title || 'Announcement'}</strong>
                      <p>{a.message}</p>
                      <small>
                        {a.createdAt && !isNaN(Date.parse(a.createdAt))
                          ? new Date(a.createdAt).toLocaleString()
                          : 'Date not available'}
                      </small>
                    </div>
                  ))
                )}
              </div>
            </>
       );


      case 'Grades':
        // ... Grades content ...
        const totalScored = assignments.reduce((acc, a) => acc + (a.marksObtained || 0), 0);
        const totalMarks = assignments.reduce((acc, a) => acc + (a.totalMarks || 0), 0);
        const percentage = totalMarks ? ((totalScored / totalMarks) * 100).toFixed(1) : '0.0';

        return (
          <>
            <h2>Grades for {courseName}</h2>
            <div style={{ display: 'flex', gap: '40px' }}>
              <div className="announcement-wrapper" style={{ flex: 1 }}>
                {assignments.length === 0 ? (
                  <p>No grades available yet.</p>
                ) : (
                  assignments.map((a, i) => (
                    <div className="assignment-item-row" key={a._id || i}>
                      <div className="assignment-left">{a.name}</div>
                      <div className="assignment-right">
                        <span>{a.marksObtained !== undefined ? `${a.marksObtained} / ${a.totalMarks}` : "Not Graded"}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="instructor-card">
                <img src="/score.png" alt="Grades" />
                <h3>Your Overall Grade:</h3>
                <div style={{ marginTop: '10px', backgroundColor: 'white', borderRadius: '20px', padding: '12px 24px', fontSize: '24px', fontWeight: 'bold', color: 'green', display: 'inline-block' }}>{percentage}%</div>
              </div>
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
                    <div className="assignment-item-row" key={s.username || i}>
                      <div className="assignment-left">
                        {s.firstName} {s.lastName}
                      </div>
                      <div className="assignment-right">
                        <button className="view-button" onClick={() => handleViewStudent(s.username)}>View Profile</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
         );
        

      case 'Syllabus':
        // ... Syllabus content ...
         return (
           <>
             <h2>Course Syllabus</h2>
             <a href="/dummy.pdf" target="_blank" rel="noopener noreferrer" style={{ fontWeight: 'bold', fontSize: '18px', color: '#0056b3', textDecoration: 'underline' }}>
               View Syllabus PDF
             </a>
           </>
         );


      default:
        return <h2>Welcome to {courseName}</h2>; // Default or Home content
    }
  };

  const tabs = ['Home', 'Assignments', 'Announcements', ...(isTeacher ? ['Students'] : ['Grades']), 'Syllabus'];

  return (
    <div className="course-page">
      <div className="sidebar">
          {/* ... Sidebar ... */}
          <ul>
           {tabs.map(tab => (
             <li key={tab} onClick={() => setActiveTab(tab)} className={(activeTab === tab || (activeTab === 'AddAssignment' && tab === 'Assignments')) ? 'active' : ''}>{tab}</li>
           ))}
          </ul>
          <img src="/books.png" alt="Books" />
      </div>

      <div className="course-content">{renderContent()}</div>

      {/* Contextual Cards */}
      {/* ... Instructor Card Logic ... */}
        {activeTab === 'Home' && (
          <div className="instructor-card">
            <img src="/professor.png" alt="Instructor" />
            <h3>Professor Muhammad</h3>
            <p>Canvas Inbox: Response time within 24–48 hours M–F.<br />Office Hours: By appointment<br /><br />Canvas Help:<br />• 1-844-865-2568<br />• Chat, Help Guides, Support Portal</p>
          </div>
        )}
        {(activeTab === 'Assignments' || activeTab === 'AddAssignment') && (
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
        {activeTab === 'Grades' && !isTeacher && (
             <div className="instructor-card">
                 <img src="/grade_info.png" alt="Grades Info" />
                 <h3>Grade Information</h3>
                 <p>• Grades are updated periodically.<br />
                  • Contact the instructor for discrepancies.<br />
                  • Check overall percentage regularly.
                 </p>
             </div>
        )}
        {activeTab === 'Students' && isTeacher && (
             <div className="instructor-card">
                 <img src="/students_icon.png" alt="Student Roster" />
                 <h3>Student Roster</h3>
                 <p>• List of enrolled students.<br />
                  • Click 'View Profile' for details.<br />
                  • Use for communication and grading.
                 </p>
             </div>
        )}
        {activeTab === 'Syllabus' && (
             <div className="instructor-card">
                 <img src="/syllabus_icon.png" alt="Syllabus Info" />
                 <h3>Syllabus Details</h3>
                 <p>• Contains course policies.<br />
                  • Includes grading breakdown.<br />
                  • Refer to it for course structure.
                 </p>
             </div>
        )}

    </div>
  );
}