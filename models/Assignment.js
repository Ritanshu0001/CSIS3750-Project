const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  totalMarks: {
    type: Number,
    required: true
  },
  dueDate: {
    type: Date,
    required: false
  },
  courseName: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true, 
  }
});

module.exports = mongoose.model('Assignment', assignmentSchema);
