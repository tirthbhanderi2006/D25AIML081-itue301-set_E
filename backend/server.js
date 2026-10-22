require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Middlewares
const requestLogger = require('./middleware/requestLogger');
const errorHandler = require('./middleware/errorHandler');

// Routes
const authRoutes = require('./routes/authRoutes');
const vehicleRoutes = require('./routes/vehicleRoutes');
const bookingRoutes = require('./routes/bookingRoutes');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/driveeasy_db';

// 1. Core Middlewares
app.use(cors());
app.use(express.json());

// 2. Global Request Logger Middleware: logs [METHOD] [PATH] [TIMESTAMP]
app.use(requestLogger);

// 3. Health & root route
app.get('/', (req, res) => {
  res.status(200).json({
    project: 'DriveEasy Car Rental System API',
    version: '1.0.0',
    status: 'online',
    rollNumber: 'D25AIML081',
    endpoints: {
      auth: '/api/v1/auth/login',
      vehicles: '/api/v1/vehicles',
      bookings: '/api/v1/bookings',
      myBookings: '/api/v1/bookings/my',
      updateStatus: '/api/v1/bookings/:id/status'
    }
  });
});

// 4. API Endpoints mounted at /api/v1
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/vehicles', vehicleRoutes);
app.use('/api/v1/bookings', bookingRoutes);

// 5. 404 handler for undefined routes
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Resource not found on endpoint: ${req.originalUrl}`
  });
});

// 6. Global Error Handling Middleware (must be registered last)
app.use(errorHandler);

// 7. Database Connection & Server Initialization
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log(' Successfully connected to MongoDB database:', MONGO_URI);
    app.listen(PORT, () => {
      console.log(` DriveEasy Express Backend running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error(' MongoDB connection failure:', err.message);
    process.exit(1);
  });

module.exports = app;
