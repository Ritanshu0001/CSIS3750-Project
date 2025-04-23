import React, { useEffect, useState } from 'react';
import './ToDo.css';

export default function ToDo() {
  const [todayTasks, setTodayTasks] = useState([]);
  const [tomorrowTasks, setTomorrowTasks] = useState([]);
  const username = localStorage.getItem('username');

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const res = await fetch(`/api/student/${username}/todo`);
        const data = await res.json();

        if (res.ok) {
          const today = [];
          const tomorrow = [];

          const now = new Date();
          const todayStr = now.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' });
          const tomorrowStr = new Date(now.getTime() + 86400000).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' });

          data.forEach(task => {
            const due = new Date(task.due_date);
            const dueStr = due.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' });

            const formatted = {
              title: task.title,
              due: dueStr,
              notes: task.description
            };

            if (dueStr === todayStr) {
              today.push(formatted);
            } else if (dueStr === tomorrowStr) {
              tomorrow.push(formatted);
            }
          });

          setTodayTasks(today);
          setTomorrowTasks(tomorrow);
        } else {
          console.error("Failed to load tasks:", data.error);
        }
      } catch (err) {
        console.error("Error fetching assignments:", err);
      }
    };

    if (username) fetchAssignments();
  }, [username]);

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
