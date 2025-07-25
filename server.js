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
const botInfoRoute = require('./api/bot-info');
const sendMessageRoute = require('./api/send-message');
const webhookHandlerRoute = require('./api/webhook');
const setCommandsRoute = require('./api/set-commands');
const updateCommandRoute = require('./api/update-command');

// API routes
app.get('/api/health', healthRoute);
app.post('/api/verify-subscription', verifySubscriptionRoute);
app.get('/api/bot-info', botInfoRoute);
app.post('/api/send-message', sendMessageRoute);
app.post('/api/webhook', webhookHandlerRoute);
app.post('/api/set-commands', setCommandsRoute);
app.post('/api/update-command', updateCommandRoute);

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'ATOMIC FLIX Telegram Backend API',
    version: '2.0.0',
    bot: {
      name: 'Atomic_flix_verifier_bot',
      channel: '@Atomic_flix_officiel'
    },
    endpoints: {
      health: 'GET /api/health',
      verifySubscription: 'POST /api/verify-subscription',
      getUserId: 'GET /api/get-user-id',
      botInfo: 'GET /api/bot-info',
      sendMessage: 'POST /api/send-message',
      webhook: 'POST /api/webhook',
      setCommands: 'POST /api/set-commands',
      updateCommand: 'POST /api/update-command'
    },
    features: {
      subscriptionVerification: 'Verify user subscription to Telegram channel',
      inlineKeyboards: 'Interactive buttons for better user experience',
      webhookSupport: 'Real-time message handling',
      commandManagement: 'Bot command configuration',
      messageDelivery: 'Send messages to users'
    },
    documentation: {
      health: 'Check bot status and configuration',
      verifySubscription: 'Verify user subscription to @Atomic_flix_officiel channel',
      getUserId: 'Get user ID from recent bot interactions',
      botInfo: 'Get detailed bot information including commands and webhook status',
      sendMessage: 'Send messages to users with optional inline keyboards',
      webhook: 'Handle incoming webhook updates from Telegram',
      setCommands: 'Configure bot commands in Telegram',
      updateCommand: 'Admin command to send push notifications for app updates'
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

// Route pour les fonctionnalités de croissance
app.post('/api/growth-features', async (req, res) => {
  const growthFeaturesHandler = require('./api/growth-features.js');
  await growthFeaturesHandler(req, res);
});

// Route pour la promotion anime
app.post('/api/anime-promotion', async (req, res) => {
  const animePromotionHandler = require('./api/anime-promotion.js');
  await animePromotionHandler(req, res);
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 ATOMIC FLIX Telegram Backend running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
  console.log(`✅ Verify subscription: http://localhost:${PORT}/api/verify-subscription`);
});