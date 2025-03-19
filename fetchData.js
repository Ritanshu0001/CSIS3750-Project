const mongoose = require('mongoose');
const db = require('./database');
const User = require('./models/User');
const Course = require('./models/Course');

async function fetchData() {
    try {
        const users = await User.find().populate('coursesEnrolled');
        console.log("Users:", users);
    } catch (err) {
        console.error("Error fetching data:", err);
    } finally {
        mongoose.connection.close();
    }
}

fetchData();
