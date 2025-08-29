const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  email: { 
    type: String,
    required: true, 
    unique: true 
  },
  password: { 
    type: String,
    required: true 
  },
  role: {
    type: String,
    enum: ['entrepreneur', 'investor'],
    required: true
  },
  profile: {
    name: { type: String },
    bio: { type: String },
    avatarUrl: { type: String },
  },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
});

module.exports = mongoose.model('User', UserSchema);
