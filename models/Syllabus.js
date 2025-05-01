const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const syllabusSchema = new Schema({
  courseName: {
    type: String,
    required: true,
    unique: true,      
    trim: true,
  },

  
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
