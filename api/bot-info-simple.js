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
    console.log('Bot info simple request');
    
    // Only allow GET requests
    if (req.method !== 'GET') {
      return res.status(405).json({
        success: false,
        error: 'Method not allowed',
        allowedMethods: ['GET']
      });
    }
    
    const bot = getBotInstance();
    
    // Get bot information and commands
    const botInfo = await bot.getMe();
    const commands = await bot.getMyCommands();
    
    console.log('Bot info retrieved successfully');
    
    return res.status(200).json({
      success: true,
      bot: {
        id: botInfo.id,
        username: botInfo.username,
        firstName: botInfo.first_name,
        isBot: botInfo.is_bot,
        canJoinGroups: botInfo.can_join_groups,
        canReadAllGroupMessages: botInfo.can_read_all_group_messages,
        supportsInlineQueries: botInfo.supports_inline_queries,
        canConnectToBusiness: botInfo.can_connect_to_business || false,
        hasMainWebApp: botInfo.has_main_web_app || false
      },
      commands: commands.map(cmd => ({
        command: cmd.command,
        description: cmd.description
      })),
      webhook: {
        url: '',
        isPolling: true,
        configured: false,
        note: 'Using polling mode for development'
      },
      channel: {
        id: process.env.CHANNEL_ID || '@Atomic_flix_officiel',
        configured: true
      },
      features: {
        subscriptionVerification: true,
        inlineKeyboards: true,
        commandHandling: true,
        messageDelivery: true,
        businessIntegration: false
      },
      api: {
        version: '2.0.0',
        endpoints: 7,
        lastUpdated: new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Bot info simple error:', error);
    
    return res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};