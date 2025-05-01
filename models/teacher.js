const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema(
  {
    teacherUsername: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      trim: true
    },
    courses: [
      {
        courseName: {
          type: String,
          required: true,
          trim: true
        },
        students: [
          {
            type: String, 
            trim: true
          }
        ]
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model('TeacherClass', teacherSchema);
