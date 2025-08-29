const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async function (req, res, next) {
  try {
    const authHeader = req.header('Authorization');
    const token = authHeader?.replace('Bearer ', '').trim();

    if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded.userId) return res.status(401).json({ msg: 'Invalid token' });

    // Fetch logged-in user from DB including profile.name
    const user = await User.findById(decoded.userId).select('profile.name email _id');
    if (!user) return res.status(401).json({ msg: 'User not found' });

    // Attach to req.user
    req.user = {
      id: user._id,
      name: user.profile?.name || 'Unknown',
      email: user.email,
      role: decoded.role || 'user'
    };

    next();
  } catch (err) {
    console.error('Auth middleware error:', err.message);
    res.status(401).json({ msg: 'Token is not valid', error: err.message });
  }
};
