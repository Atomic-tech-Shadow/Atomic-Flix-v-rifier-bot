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
    console.log('Send message request');
    
    // Only allow POST requests
    if (req.method !== 'POST') {
      return res.status(405).json({
        success: false,
        error: 'Method not allowed',
        allowedMethods: ['POST']
      });
    }
    
    // Validate Content-Type
    if (!req.headers['content-type'] || !req.headers['content-type'].includes('application/json')) {
      return res.status(400).json({
        success: false,
        error: 'Content-Type must be application/json'
      });
    }
    
    const { userId, message, useInlineKeyboard = false } = req.body;
    
    // Validate required fields
    if (!userId || !message) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: userId and message',
        requiredFields: ['userId', 'message']
      });
    }
    
    const bot = getBotInstance();
    
    // Create inline keyboard for subscription verification
    const inlineKeyboard = {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: '✅ Vérifier mon abonnement',
              callback_data: 'verify_subscription'
            }
          ],
          [
            {
              text: '📱 Rejoindre @Atomic_flix_officiel',
              url: 'https://t.me/Atomic_flix_officiel'
            }
          ]
        ]
      }
    };
    
    // Send message with or without inline keyboard
    const messageOptions = useInlineKeyboard ? inlineKeyboard : {};
    const sentMessage = await bot.sendMessage(userId, message, messageOptions);
    
    console.log(`Message sent successfully to user ${userId}`);
    
    return res.status(200).json({
      success: true,
      message: 'Message sent successfully',
      sentMessage: {
        messageId: sentMessage.message_id,
        chatId: sentMessage.chat.id,
        text: sentMessage.text,
        date: new Date(sentMessage.date * 1000).toISOString(),
        hasInlineKeyboard: useInlineKeyboard
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Send message error:', error);
    
    // Handle specific Telegram errors
    if (error.code === 'ETELEGRAM') {
      const errorMessage = error.response?.body?.description || error.message;
      
      if (errorMessage.includes('blocked by user')) {
        return res.status(403).json({
          success: false,
          error: 'User has blocked the bot',
          errorType: 'blocked_by_user'
        });
      }
      
      if (errorMessage.includes('chat not found')) {
        return res.status(404).json({
          success: false,
          error: 'Chat not found',
          errorType: 'chat_not_found'
        });
      }
    }
    
    return res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};