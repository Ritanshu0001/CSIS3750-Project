import React from 'react';
import './ToDo.css';

const tasks = [
  { title: 'Assignment 2', due: '2/12', notes: 'Discuss both views and aspects.' },
  { title: 'Assignment 2', due: '2/12', notes: 'Discuss both views and aspects.' },
  { title: 'Assignment 2', due: '2/12', notes: 'Discuss both views and aspects.' }
];

export default function ToDo() {
  return (
    <div className="todo-container">
      <div className="todo-section">
        <h2>Due Today:</h2>
        <div className="todo-cards">
          {tasks.map((task, index) => (
            <div className="todo-card" key={`today-${index}`}>
              <img src="/class_img.png" alt="Task" />
              <h3>{task.title}</h3>
              <ul>
                <li>Due {task.due}</li>
                <li>{task.notes}</li>
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="todo-section">
        <h2>Tomorrow:</h2>
        <div className="todo-cards">
          {tasks.map((task, index) => (
            <div className="todo-card" key={`tomorrow-${index}`}>
              <img src="/class_img.png" alt="Task" />
              <h3>{task.title}</h3>
              <ul>
                <li>Due {task.due}</li>
                <li>{task.notes}</li>
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
