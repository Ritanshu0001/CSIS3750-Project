const mongoose = require('mongoose');

const optionSchema = new mongoose.Schema({
    text: { type: String, required: true },
    isCorrect: { type: Boolean, required: true }
});

const questionSchema = new mongoose.Schema({
    questionText: { type: String, required: true },
    options: [optionSchema],
    points: { type: Number, default: 1 }
});

const assessmentSchema = new mongoose.Schema({
    title: { type: String, required: true },
    questions: [questionSchema],
    passingScore: { type: Number, required: true },
    module: { type: mongoose.Schema.Types.ObjectId, ref: 'Module' }
});

module.exports = mongoose.model('Assessment', assessmentSchema);
