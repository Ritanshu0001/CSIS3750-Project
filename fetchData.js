const mongoose = require('mongoose');
require('./database'); // Make sure this properly sets up your MongoDB connection
const User = require('./Models/User'); 

async function fetchData() {
    try {
        // Fetch all user documents from the database without populating any fields
        const users = await User.find();
        console.log("Users:", users);
    } catch (err) {
        console.error("Error fetching data:", err);
    } finally {
        // Close the MongoDB connection
        mongoose.connection.close();
    }
}

fetchData();
