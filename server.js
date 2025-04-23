const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Importing routes
const userRoutes = require('./routes/userRoutes');
const courseRoutes = require('./routes/courseRoutes');
const discussionRoutes = require('./routes/discussionRoutes');
const assessmentRoutes = require('./routes/assessmentRoutes');
const progressRoutes = require('./routes/progressRoutes');
const assignmentRoutes = require('./routes/assignmentRoutes');

// Create the Express application
const app = express();

// MongoDB URI from environment variables
const dbUri = process.env.MONGODB_URI;
console.log('Attempting to connect to MongoDB with URI:', dbUri); // Debugging URI

// Async function to connect to the database
async function connectDatabase() {
    try {
        await mongoose.connect(dbUri, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log('MongoDB connected successfully');
    } catch (err) {
        console.error('Error connecting to MongoDB:', err);
    }
}

// Connect to MongoDB
connectDatabase();

// Middleware
app.use(cors()); // Enable CORS
app.use(express.json()); // Parse JSON bodies

// Use routes
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/discussions', discussionRoutes);
app.use('/api/assessments', assessmentRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/assignments', assignmentRoutes);  // Ensure the route is plural if it's a collection of resources

// Error handler for routes not found
app.use((req, res, next) => {
    res.status(404).send('Endpoint Not Found');
});

// Global error handler
app.use((error, req, res, next) => {
    res.status(500).send('Internal Server Error');
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
