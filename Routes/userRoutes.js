const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../Models/User'); // Ensure this matches your actual path

// Create a new user
router.post('/', async (req, res) => {
  const {
    email,
    password,
    phoneNumber,
    university,
    firstName,
    lastName,
    displayName,
    profilePicture
  } = req.body;

  try {
    // Hashing the password before storing it
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      email,
      password: hashedPassword,
      phoneNumber,
      university,
      firstName,
      lastName,
      displayName,
      profilePicture
    });

    await newUser.save();

    // Remove password from the response
    const userToReturn = { ...newUser._doc };
    delete userToReturn.password;

    res.status(201).json(userToReturn);
  } catch (error) {
    res.status(400).json({ message: "Error creating user", error: error.message });
  }
});

// Retrieve all users (excluding the password)
router.get('/', async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving users", error: error.message });
  }
});

// Update a user
router.put('/:id', async (req, res) => {
  const updates = { ...req.body };

  try {
    // If a new password is provided, re-hash it
    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    }

    // { new: true } => return the updated document
    // { runValidators: true } => ensure schema validations run on update
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(updatedUser);
  } catch (error) {
    res.status(400).json({ message: "Error updating user", error: error.message });
  }
});

// Delete a user
router.delete('/:id', async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User deleted successfully", userId: deletedUser._id });
  } catch (error) {
    res.status(500).json({ message: "Error deleting user", error: error.message });
  }
});

module.exports = router;
