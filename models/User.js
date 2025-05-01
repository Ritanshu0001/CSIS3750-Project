const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true, 
      trim: true
    },
    email: {
      type: String,
      required: true,
      trim: true,
      
    },
    password: {
      type: String,
      required: true
    },
    phoneNumber: {
      type: String
    },
    university: {
      type: String
    },
    firstName: {
      type: String
    },
    lastName: {
      type: String
    },
    displayName: {
      type: String
    },
    profilePicture: {
      data: Buffer,         
      contentType: String   
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
