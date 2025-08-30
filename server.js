// server.js
const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./db/connection');
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const meetingRoutes = require('./routes/meetings');
const paymentRoutes = require('./routes/payment');
const cors = require('cors');
const path = require('path');
const authMiddleware = require('./middleware/auth');

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));

// Serve static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/auth/profile', profileRoutes);
app.use('/api/meetings', authMiddleware, meetingRoutes);
app.use('/api/documents', require('./routes/documents'));
app.use('/api/payment', paymentRoutes);

// Root route for testing
app.get('/', (req, res) => {
  res.send('Server is running!');
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
