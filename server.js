// server.js
const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./db/connection');
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const meetingRoutes = require('./routes/meetings');
const paymentRoutes = require('./routes/payment');
const documentsRoutes = require('./routes/documents');
const authMiddleware = require('./middleware/auth');
const path = require('path');
const cors = require('cors');

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(express.json());

// ✅ Dynamic CORS setup (local + all Vercel deployments)
const allowedOrigins = [
  "http://localhost:5173",        // Local development
  "https://*.vercel.app"          // Any Vercel frontend deployment
];

app.use(cors({
  origin: function(origin, callback) {
    if(!origin) return callback(null, true); // allow non-browser requests (Postman, etc)
    const isAllowed = allowedOrigins.some(o => {
      const pattern = new RegExp("^" + o.replace("*", ".*") + "$");
      return pattern.test(origin);
    });
    if(isAllowed) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

// Serve static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/auth/profile', profileRoutes);
app.use('/api/meetings', authMiddleware, meetingRoutes);
app.use('/api/documents', documentsRoutes);
app.use('/api/payment', paymentRoutes);

// Example route
app.get("/", (req, res) => {
  res.send("Backend is running!");
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
