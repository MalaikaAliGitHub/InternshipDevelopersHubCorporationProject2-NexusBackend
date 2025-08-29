const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./db/connection');
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const meetingRoutes = require('./routes/meetings');
const cors = require('cors');
const path = require('path');
const authMiddleware = require('./middleware/auth'); // Correct path
const paymentRoutes = require('./routes/payment');

dotenv.config();
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));

// Serve static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
// Routes
app.use('/api/auth', authRoutes);
app.use('/api/auth/profile', profileRoutes);
app.use('/api/meetings', authMiddleware, meetingRoutes); // Protect meetings routes
app.use('/api/documents', require('./routes/documents')); // Documents routes
app.use('/api/payment', paymentRoutes); // Payment routes
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
