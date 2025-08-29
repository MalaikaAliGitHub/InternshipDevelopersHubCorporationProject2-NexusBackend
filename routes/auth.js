const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const auth = require('../middleware/auth'); 

// Register new user
router.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: 'User already exists' });
    
    const hashedPassword = await bcrypt.hash(password, 10);

    user = new User({
      email,
      password: hashedPassword,
      role,
      profile: { name },
    });

    await user.save();

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // ✅ send user object in response
    res.status(201).json({ 
      msg: 'User registered successfully', 
      token,
      user: { id: user._id, email: user.email, role: user.role, profile: user.profile }
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Login route
router.post('/login', async (req, res) => {
  const { email, password, role } = req.body;

  try {
    const user = await User.findOne({ email, role });
    if (!user) return res.status(400).json({ msg: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ 
      token,
      user: { id: user._id, email: user.email, role: user.role, profile: user.profile }
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Forgot password - generate reset token
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(200).json({ msg: 'If that email exists, a reset link has been sent' });

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = Date.now() + 1000 * 60 * 15; // 15 minutes

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(resetExpires);
    await user.save();

    // In production, send an email. For now, return token for testing.
    res.json({ msg: 'Password reset token generated', token: resetToken });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Reset password using token
router.post('/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;
  try {
    const user = await User.findOne({ 
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() }
    });
    if (!user) return res.status(400).json({ msg: 'Invalid or expired reset token' });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ msg: 'Password reset successful' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

//   Get all users (for dropdown in frontend calendar)
router.get('/users', auth, async (req, res) => {
  try {
    const users = await User.find({}, '_id email role profile.name');
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});


module.exports = router;
