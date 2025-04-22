
import React, { useState } from 'react';
import './Course.css';

export default function Course() {
  const [activeTab, setActiveTab] = useState('Home');

  const renderContent = () => {
    switch (activeTab) {
      case 'Home':
        return (
          <>
            <h2>Welcome to CSIS 7077</h2>
            <ul>
              <li>My name is [Instructor Name] and I will be your instructor for this course. I'm looking forward to an engaging and productive semester with all of you. Please take some time to carefully review the course syllabus, weekly schedule, and the materials provided in the course platform. Everything you need to succeed this semester is available in the course modules.</li>
              <li><strong>Course Description</strong><br />
                An introduction to the principles and practices of [subject name], emphasizing critical thinking, conceptual understanding, and practical application. Topics include [topic 1], [topic 2], and [topic 3]. Frequency: Offered every Fall and Spring.
              </li>
              <li><strong>Getting Started</strong>
                <ul>
                  <li>Review the full course syllabus.</li>
                  <li>Make sure to check the weekly course schedule.</li>
                  <li>Obtain access to the required course textbook or digital version.</li>
                  <li>Familiarize yourself with how assignments and quizzes will be submitted.</li>
                </ul>
              </li>
              <li><strong>Text Information</strong><br />
                [Course Title], [Edition Number]<br />
                • [Author One]<br />
                • [Author Two]<br />
                Published by [Publisher Name] ([Publication Date]) – Copyright © [Year], [Publisher]
              </li>
              <li>I’m excited to start this journey with you and I’m here to support your success in this course. Let’s have a great semester!</li>
            </ul>
          </>
        );

      case 'Assignments':
        return (
          <>
            <h2>Assignments</h2>
            <div className="assignment-box">
              {[
                { title: "Assignment 1: Essay on Climate Change", date: "04/22", completed: true },
                { title: "Assignment 2: Data Analysis Project", date: "04/30", completed: true },
                { title: "Assignment 3: Research Reflection", date: "05/08", completed: false },
                { title: "Assignment 4: Oral Presentation", date: "05/15", completed: false },
              ].map((assignment, index) => (
                <div className="assignment-row" key={index}>
                  <span className="assignment-name">{assignment.title}</span>
                  <div className="assignment-meta">
                    <span className="assignment-due">Due: {assignment.date}</span>
                    <img
                      className="assignment-icon"
                      src={assignment.completed ? "/checkmark.png" : "/circle1.png"}
                      alt={assignment.completed ? "Completed" : "Pending"}
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
            <h2>Announcements for CSIS 7077:</h2>
            <div className="assignment-box">
              {Array(4).fill().map((_, index) => (
                <div className="assignment-row" key={index}>
                  <span className="assignment-name">No class on Friday</span>
                  <span className="assignment-due">08/12</span>
                </div>
              ))}
            </div>
          </>
        );

      case 'Grades':
        return (
          <>
            <h2>Grades for CSIS 7077:</h2>
            <div className="assignment-box">
              {Array(4).fill().map((_, index) => (
                <div className="assignment-row" key={index}>
                  <span className="assignment-name">Assignment 2</span>
                  <span className="grade-tag">100%</span>
                </div>
              ))}
            </div>
          </>
        );

      case 'Syllabus':
        return (
          <>
            <h2>Course Syllabus</h2>
            <p>
              <a href="https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" target="_blank" rel="noopener noreferrer" style={{ fontWeight: 'bold', fontSize: '18px', color: '#000', textDecoration: 'underline' }}>
                View Syllabus PDF
              </a>
            </p>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="course-page">
      <div className="sidebar">
        <ul>
          {['Home', 'Assignments', 'Announcements', 'Grades', 'Syllabus'].map(tab => (
            <li
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={activeTab === tab ? 'active' : ''}
            >
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
          <p>Canvas Inbox: Response time within 24-48 hours M-F.<br />
            Office Hours: By appointment<br /><br />
            Canvas Online Support Options Include:<br />
            • Phone: 1-844-865-2568<br />
            • Canvas Live Chat<br />
            • Canvas Help Guides<br />
            • Selecting the Help button inside Canvas
          </p>
        </div>
      )}

      {activeTab === 'Assignments' && (
        <div className="instructor-card">
          <img src="/assignment.png" alt="Assignments" />
          <h3>Assignment Info</h3>
          <p>• Submit through Canvas only<br />
            • File formats allowed: .docx, .pdf<br />
            • Late submissions may not be accepted<br />
            • Contact your professor if you run into issues
          </p>
        </div>
      )}

      {activeTab === 'Announcements' && (
        <div className="instructor-card">
          <img src="/professor.png" alt="Announcements" />
          <h3>Professor Muhammad</h3>
          <p>• No class announcements may be updated weekly<br />
            • Refresh the page to check for latest info<br />
            • Contact your professor for urgent updates</p>
        </div>
      )}

      {activeTab === 'Grades' && (
        <div className="instructor-card">
          <img src="/score.png" alt="Grades" />
          <h3>Overall Grade for CSIS 7077:</h3>
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
