const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config(); // Ensure your .env file is configured correctly

// Importing routes
const userRoutes = require('./routes/userRoutes');
const courseRoutes = require('./routes/courseRoutes');
const discussionRoutes = require('./routes/discussionRoutes');
const assessmentRoutes = require('./routes/assessmentRoutes'); // Correct the file name if necessary
const progressRoutes = require('./routes/progressRoutes');

// Create the Express application
const app = express();

// MongoDB connection setup
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.error('Error connecting to MongoDB:', err));

// Middleware
app.use(cors()); // Enable CORS
app.use(express.json()); // Parse JSON bodies

// Use routes
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/discussions', discussionRoutes);
app.use('/api/assessments', assessmentRoutes);
app.use('/api/progress', progressRoutes);

// Error handler for routes not found
app.use((req, res, next) => {
  res.status(404).send('Endpoint Not Found');
});

// Global error handler
app.use((error, req, res, next) => {
  res.status(500).send('Internal Server Error');
});

// Server listening
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
