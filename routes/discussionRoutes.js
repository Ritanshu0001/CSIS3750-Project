const express = require('express');
const router = express.Router();
const Post = require('../models/Discussion');

// Post a message
router.post('/', async (req, res) => {
    try {
        const post = new Post({
            user: req.body.user,
            text: req.body.text,
            course: req.body.course
        });
        await post.save();
        res.status(201).json(post);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Get all posts for a course
router.get('/:courseId', async (req, res) => {
    try {
        const posts = await Post.find({ course: req.params.courseId }).populate('user');
        res.json(posts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
