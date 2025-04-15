const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true
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
    // Change this to an object that can store binary data and contentType
    profilePicture: {
      data: Buffer,         // Binary image data
      contentType: String   // E.g., "image/png" or "image/jpeg"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
