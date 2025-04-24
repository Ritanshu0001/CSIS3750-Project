import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';

export default function Assignment() {
  const { id } = useParams();
  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    totalMarks: '',
    dueDate: '',
  });

  useEffect(() => {
    fetch(`http://localhost:5000/test/assignment/${id}`)
      .then(res => res.json())
      .then(data => {
        setAssignment(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching assignment:", err);
        setLoading(false);
      });
  }, [id]);

  const handleAddAssignment = () => {
    setShowForm(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      totalMarks: parseInt(formData.totalMarks),
      username: localStorage.getItem('username'),
      courseName: assignment.courseName
    };
    const res = await fetch('http://localhost:5000/test/assignments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const result = await res.json();
    if (res.ok) {
      alert('Assignment added successfully!');
      setShowForm(false);
    } else {
      alert(result.error || 'Failed to add assignment.');
    }
  };

  if (loading) return <div className="assignment-box">Loading assignment details...</div>;

  if (!assignment || assignment.error) return <div className="assignment-box">Assignment not found.</div>;

  return (
    <div className="assignment-box">
      <h2>{assignment.name}</h2>
      <p>{assignment.description}</p>
      <p>Due: {new Date(assignment.dueDate).toLocaleDateString()}</p>
      <p>Total Marks: {assignment.totalMarks}</p>

      <button onClick={handleAddAssignment}>Add New Assignment</button>

      {showForm && (
        <form onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
          <input
            name="name"
            placeholder="Assignment Name"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <textarea
            name="description"
            placeholder="Description"
            value={formData.description}
            onChange={handleChange}
            required
          />
          <input
            name="totalMarks"
            type="number"
            placeholder="Total Marks"
            value={formData.totalMarks}
            onChange={handleChange}
            required
          />
          <input
            name="dueDate"
            type="date"
            value={formData.dueDate}
            onChange={handleChange}
            required
          />
          <input
            name="dueTime"
            type="time"
            value={formData.dueTime}
            onChange={handleChange}
            required
          />

          <button type="submit">Submit Assignment</button>
        </form>
      )}
    </div>
  );
}