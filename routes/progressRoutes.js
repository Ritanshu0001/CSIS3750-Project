const express = require('express');
const router = express.Router();
const Progress = require('../models/Progress');

// Update or create progress
router.post('/', async (req, res) => {
    try {
        const progress = await Progress.findOneAndUpdate(
            { user: req.body.user, module: req.body.module },
            req.body,
            { new: true, upsert: true }
        );
        res.json(progress);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Get user progress for a course
router.get('/:userId/:courseId', async (req, res) => {
    try {
        const progress = await Progress.find({ user: req.params.userId, course: req.params.courseId });
        res.json(progress);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
