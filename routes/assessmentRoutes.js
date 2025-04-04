const express = require('express');
const router = express.Router();
const Assessment = require('../models/Assessment');

// Create an assessment
router.post('/', async (req, res) => {
    try {
        const assessment = new Assessment(req.body);
        await assessment.save();
        res.status(201).json(assessment);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Get all assessments
router.get('/', async (req, res) => {
    try {
        const assessments = await Assessment.find().populate('module');
        res.json(assessments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
