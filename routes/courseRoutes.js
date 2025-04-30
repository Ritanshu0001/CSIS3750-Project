const express = require('express');
const router = express.Router();
const Course = require('../models/Course');

// Create a new course
router.post('/', async (req, res) => {
    const course = new Course(req.body);
    try {
        await course.save();
        res.status(201).send(course);
    } catch (error) {
        res.status(400).send(error);
    }
});

// Retrieve all courses
router.get('/', async (req, res) => {
    try {
        const courses = await Course.find().populate('modules'); // Assuming courses reference modules
        res.status(200).send(courses);
    } catch (error) {
        res.status(500).send(error);
    }
});

// Update a course
router.put('/:id', async (req, res) => {
    try {
        const course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!course) {
            return res.status(404).send();
        }
        res.send(course);
    } catch (error) {
        res.status(400).send(error);
    }
});

// Delete a course
router.delete('/:id', async (req, res) => {
    try {
        const course = await Course.findByIdAndDelete(req.params.id);
        if (!course) {
            return res.status(404).send();
        }
        res.send(course);
    } catch (error) {
        res.status(500).send(error);
    }
});

module.exports = router;
