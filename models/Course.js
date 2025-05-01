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
    
    username: {
        type: String,
        required: true  
    }
});

module.exports = mongoose.model('Course', courseSchema);
