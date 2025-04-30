require('dotenv').config();
const mongoose = require('mongoose');

const mongoDBUri = process.env.MONGODB_URI;

if (!mongoDBUri) {
    console.error("MongoDB URI is not set. Please check your .env file.");
    process.exit(1);
}

mongoose.connect(mongoDBUri)
    .then(() => console.log('MongoDB connected successfully'))
    .catch(err => console.error('Error connecting to MongoDB:', err));

// Get the mongoose connection object
const db = mongoose.connection;

// Event listeners for MongoDB connection status
db.on('connected', () => {
    console.log('MongoDB connected');
});

db.on('error', (err) => {
    console.log('MongoDB connection error:', err);
});

db.on('disconnected', () => {
    console.log('MongoDB disconnected');
});

// Export the connection for use in other parts of your app
module.exports = db;
