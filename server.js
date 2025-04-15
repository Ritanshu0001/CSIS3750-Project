const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Importing routes
const userRoutes = require('./Routes/userRoutes');

// Create the Express application
const app = express();

// MongoDB URI from environment variables
const dbUri = process.env.MONGODB_URI;
console.log('Attempting to connect to MongoDB with URI:', dbUri); // Debugging URI

// Async function to connect to the database
async function connectDatabase() {
    try {
        await mongoose.connect(dbUri);
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
