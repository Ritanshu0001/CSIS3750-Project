// ToDo.js
import React, { useEffect, useState } from 'react';
import './ToDo.css';

export default function ToDo() {
  const [todayTasks, setTodayTasks] = useState([]);
  const [tomorrowTasks, setTomorrowTasks] = useState([]);
  const username = localStorage.getItem('username');

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const res = await fetch(`http://localhost:5000/test/student/${username}/todo`);
        const data = await res.json();

        if (!res.ok) {
          console.error("Failed to load tasks:", data.error);
          return;
        }

        const today = [];
        const tomorrow = [];

        const now = new Date();
        const todayStr = now.toDateString(); // readable form
        const tomorrowStr = new Date(now.getTime() + 86400000).toDateString(); // +1 day

        data.forEach(task => {
          const dueDate = new Date(task.dueDate);
          const dueStr = dueDate.toDateString();

          const formatted = {
            title: task.name || task.title || "Untitled",
            due: dueDate.toLocaleDateString(),
            notes: task.description || "No description provided"
          };

          if (dueStr === todayStr) {
            today.push(formatted);
          } else if (dueStr === tomorrowStr) {
            tomorrow.push(formatted);
          }
        });

        setTodayTasks(today);
        setTomorrowTasks(tomorrow);
      } catch (err) {
        console.error("Error fetching assignments:", err);
      }
    };

    if (username) {
      fetchAssignments();
    }
  }, [username]);

  return (
    <div className="todo-container">
      <div className="todo-section">
        <h2>Due Today:</h2>
        <div className="todo-cards">
          {todayTasks.length > 0 ? (
            todayTasks.map((task, index) => (
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
            ))
          ) : (
            <p>No assignments due today.</p>
          )}
        </div>
      </div>

      <div className="todo-section">
        <h2>Tomorrow:</h2>
        <div className="todo-cards">
          {tomorrowTasks.length > 0 ? (
            tomorrowTasks.map((task, index) => (
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
            ))
          ) : (
            <p>No assignments due tomorrow.</p>
          )}
        </div>
      </div>
    </div>
  );
}
