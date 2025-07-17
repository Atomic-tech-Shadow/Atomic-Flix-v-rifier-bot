const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import API routes
const healthRoute = require('./api/health');
const verifySubscriptionRoute = require('./api/verify-subscription');
const getUserIdRoute = require('./api/get-user-id');

// API routes
app.get('/api/health', healthRoute);
app.post('/api/verify-subscription', verifySubscriptionRoute);
app.get('/api/get-user-id', getUserIdRoute);

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'ATOMIC FLIX Telegram Backend API',
    version: '1.0.0',
    endpoints: {
      health: 'GET /api/health',
      verifySubscription: 'POST /api/verify-subscription'
    },
    documentation: {
      health: 'Check bot status and configuration',
      verifySubscription: 'Verify user subscription to @Atomic_flix_officiel channel'
    }
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 ATOMIC FLIX Telegram Backend running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
  console.log(`✅ Verify subscription: http://localhost:${PORT}/api/verify-subscription`);
});