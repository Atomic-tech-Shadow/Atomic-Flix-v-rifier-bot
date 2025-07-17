const { getBotInstance } = require('../lib/telegramBot');

// CORS headers for React Native
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
  'Access-Control-Max-Age': '86400'
};

module.exports = async (req, res) => {
  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).json({});
  }
  
  // Set CORS headers
  Object.keys(corsHeaders).forEach(key => {
    res.setHeader(key, corsHeaders[key]);
  });
  
  try {
    console.log('Get user ID endpoint called');
    
    // Only allow GET requests
    if (req.method !== 'GET') {
      return res.status(405).json({
        success: false,
        error: 'Method not allowed',
        allowedMethods: ['GET']
      });
    }
    
    const bot = getBotInstance();
    
    // Get recent updates to find user messages
    const updates = await bot.getUpdates();
    
    // Find the most recent message
    const recentMessages = updates
      .filter(update => update.message)
      .sort((a, b) => b.message.date - a.message.date)
      .slice(0, 10);
    
    console.log('Recent messages found:', recentMessages.length);
    
    const userMessages = recentMessages.map(update => ({
      userId: update.message.from.id,
      username: update.message.from.username,
      firstName: update.message.from.first_name,
      lastName: update.message.from.last_name,
      text: update.message.text,
      date: new Date(update.message.date * 1000).toISOString()
    }));
    
    return res.status(200).json({
      success: true,
      message: 'Recent user messages from bot',
      users: userMessages,
      instructions: {
        step1: 'Send a message to @Atomic_flix_verifier_bot on Telegram',
        step2: 'Call this endpoint again to get your user ID',
        step3: 'Use your user ID to test the subscription verification'
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Get user ID error:', error);
    
    return res.status(500).json({
      success: false,
      error: error.message,
      instructions: {
        step1: 'Send a message to @Atomic_flix_verifier_bot on Telegram',
        step2: 'The bot needs to receive a message to get your user ID'
      },
      timestamp: new Date().toISOString()
    });
  }
};