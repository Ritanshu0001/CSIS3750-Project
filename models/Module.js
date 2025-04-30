const mongoose = require('mongoose');

const moduleSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: String,
    nextModule: { type: mongoose.Schema.Types.ObjectId, ref: 'Module' }
});

module.exports = mongoose.model('Module', moduleSchema);
