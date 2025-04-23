import React from 'react';
import './ToDo.css';

const todayTasks = [
  { title: 'Assignment 2', due: '2/12', notes: 'Discuss both views and aspects.' },
  { title: 'Math Homework', due: '2/12', notes: 'Finish problems 10–20 on page 47.' },
  { title: 'Reading Log', due: '2/12', notes: 'Summarize chapters 5 and 6.' },
  { title: 'Biology Quiz', due: '2/12', notes: 'Revise the mitosis and meiosis topics.' }
];

const tomorrowTasks = [
  { title: 'Assignment 3', due: '2/13', notes: 'Prepare counterarguments and conclusion.' },
  { title: 'Group Project', due: '2/13', notes: 'Meet with team to divide tasks.' },
  { title: 'History Essay', due: '2/13', notes: 'Draft introduction and thesis statement.' },
  { title: 'Chemistry Lab Report', due: '2/13', notes: 'Complete data analysis and graph.' }
];

export default function ToDo() {
  return (
    <div className="todo-container">
      <div className="todo-section">
        <h2>Due Today:</h2>
        <div className="todo-cards">
          {todayTasks.map((task, index) => (
            <div className="todo-card" key={`today-${index}`}>
              <div className="todo-text">
                <h3>{task.title}</h3>
                <ul>
                  <li><strong>Due:</strong> {task.due}</li>
                  <li>{task.notes}</li>
                </ul>
              </div>
              <img src="/class_img.png" alt="Task illustration" />
            </div>
          ))}
        </div>
      </div>

      <div className="todo-section">
        <h2>Tomorrow:</h2>
        <div className="todo-cards">
          {tomorrowTasks.map((task, index) => (
            <div className="todo-card" key={`tomorrow-${index}`}>
              <div className="todo-text">
                <h3>{task.title}</h3>
                <ul>
                  <li><strong>Due:</strong> {task.due}</li>
                  <li>{task.notes}</li>
                </ul>
              </div>
              <img src="/class_img.png" alt="Task illustration" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}