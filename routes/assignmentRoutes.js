const express = require('express');
const router = express.Router();
const Assignments = require('../models/assignment');

// POST endpoint for creating a new assignment
router.post('/', async (req, res) => {
    try {
        const newAssignment = new Assignment(req.body);
        const savedAssignment = await newAssignment.save();
        res.status(201).json(savedAssignment);
    } catch (error) {
        res.status(400).json({ message: "Failed to create assignment", error: error.message });
    }
});

// GET endpoint for listing all assignments
router.get('/', async (req, res) => {
    try {
        const assignments = await Assignment.find({});
        res.status(200).json(assignments);
    } catch (error) {
        res.status(500).json({ message: "Failed to get assignments", error: error.message });
    }
});

// GET endpoint for a single assignment by ID
router.get('/:id', async (req, res) => {
    try {
        const assignment = await Assignment.findById(req.params.id);
        if (!assignment) {
            return res.status(404).json({ message: "Assignment not found" });
        }
        res.json(assignment);
    } catch (error) {
        res.status(500).json({ message: "Failed to retrieve the assignment", error: error.message });
    }
});

// PUT endpoint for updating an assignment by ID
router.put('/:id', async (req, res) => {
    const updates = req.body;
    try {
        const updatedAssignment = await Assignment.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
        if (!updatedAssignment) {
            return res.status(404).json({ message: "Assignment not found" });
        }
        res.json(updatedAssignment);
    } catch (error) {
        res.status(400).json({ message: "Failed to update assignment", error: error.message });
    }
});

// DELETE endpoint for deleting an assignment by ID
router.delete('/:id', async (req, res) => {
    try {
        const deletedAssignment = await Assignment.findByIdAndDelete(req.params.id);
        if (!deletedAssignment) {
            return res.status(404).json({ message: "Assignment not found" });
        }
        res.json({ message: "Assignment successfully deleted", userId: deletedAssignment._id });
    } catch (error) {
        res.status(500).json({ message: "Failed to delete assignment", error: error.message });
    }
});

module.exports = router;
