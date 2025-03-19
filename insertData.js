const mongoose = require('mongoose');
const db = require('./database');
const User = require('./models/User');
const Course = require('./models/Course');
const Module = require('./models/Module');

async function insertData() {
    try {
        // Insert Sample Course
        const course = await Course.create({
            courseName: "Introduction to Programming",
            description: "A beginner-friendly programming course",
            modules: []
        });

        console.log("Course Created:", course);

        // Insert Sample User
        const user = await User.create({
            username: "johnDoe",
            password: "password123",
            roles: ["student"],
            coursesEnrolled: [course._id]
        });

        console.log("User Created:", user);

        // Insert Sample Module
        const module = await Module.create({
            title: "Variables and Data Types",
            content: "Introduction to variables and data types in programming.",
            nextModule: null
        });

        console.log("Module Created:", module);

    } catch (err) {
        console.error("Error inserting data:", err);
    } finally {
        mongoose.connection.close(); // Close the database connection
    }
}

insertData();
