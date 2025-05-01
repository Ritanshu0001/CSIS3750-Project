require('dotenv').config();
const bcrypt = require('bcrypt');
const db = require('./database'); 

const User = require('./models/User');
const TeacherClass = require('./models/teacher'); 

async function insertData() {
  try {
    console.log("Checking user...");

    
    const existingUser = await User.findOne({ username: "teacher" });
    if (!existingUser) {
      const hashedPassword = await bcrypt.hash("123", 10);
      const newUser = await User.create({
        username: "teacher",
        email: "teacher@nova.edu",
        password: hashedPassword,
        phoneNumber: "123-456-7891",
        university: "NSU",
        firstName: "Teach",
        lastName: "Dote",
        displayName: "Joff",
        profilePicture: "https://example.com/myProfilePicture.jpg"
      });
      console.log(" User Created:", newUser.username);
    } else {
      console.log("User already exists:", existingUser.username);
    }

    
    console.log("🔍 Checking teacherClasses...");
    const existingClass = await TeacherClass.findOne({ teacherUsername: "teacher" });
    if (!existingClass) {
      const newClass = await TeacherClass.create({
        teacherUsername: "teacher",
        email: "teacher@nova.edu",
        courses: [
          {
            courseName: "Web Development",
            students: ["jm6", "jm6013"]
          },
          {
            courseName: "Cyber Security",
            students: ["jm6013"]
          }
        ]
      });
      console.log("TeacherClass Created:", newClass.teacherUsername);
    } else {
      console.log("TeacherClass already exists for:", existingClass.teacherUsername);
    }

  } catch (err) {
    console.error("Error inserting data:", err);
  } finally {
    db.close();
    console.log("MongoDB disconnected");
  }
}

insertData();
