const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const syllabusSchema = new Schema({
  courseName: {
    type: String,
    required: true,
    unique: true,      // one syllabus per course
    trim: true,
  },

  // store either a URL/relative path or, if you prefer, the GridFS ObjectId
  pdfPath: {
    type: String,
    required: true,
  },

  uploadedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Syllabus', syllabusSchema);
