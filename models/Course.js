const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    courseName: {
        type: String,
        required: true
    },
    description: String,
    modules: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Module'
    }],
    // Adding the username field to associate a course with a user
    username: {
        type: String,
        required: true  // Set to true if every course must be associated with a user
    }
});

module.exports = mongoose.model('Course', courseSchema);
