const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

// Get user profile
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) return res.status(404).json({ msg: 'User not found' });

    res.json(user.profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Update user profile
router.put('/', auth, async (req, res) => {
  try {
    const updates = req.body;
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    user.profile = { ...user.profile, ...updates };
    // If name exists in profile, also align a top-level convenience if needed (frontend maps name from profile)
    await user.save();

    res.json(user.profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
