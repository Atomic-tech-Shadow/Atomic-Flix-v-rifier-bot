const { getBotInfo } = require('../lib/telegramBot');

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
    console.log('Health check requested');
    
    // Only allow GET requests
    if (req.method !== 'GET') {
      return res.status(405).json({
        success: false,
        error: 'Method not allowed',
        allowedMethods: ['GET']
      });
    }
    
    // Get bot information
    const botInfo = await getBotInfo();
    
    if (!botInfo.success) {
      console.error('Bot health check failed:', botInfo.error);
      return res.status(503).json({
        success: false,
        status: 'unhealthy',
        error: botInfo.error,
        timestamp: new Date().toISOString()
      });
    }
    
    console.log('Bot health check successful:', botInfo.bot.username);
    
    // Return healthy status with bot information
    return res.status(200).json({
      success: true,
      status: 'healthy',
      bot: {
        id: botInfo.bot.id,
        username: botInfo.bot.username,
        firstName: botInfo.bot.first_name,
        isBot: botInfo.bot.is_bot,
        canJoinGroups: botInfo.bot.can_join_groups,
        canReadAllGroupMessages: botInfo.bot.can_read_all_group_messages,
        supportsInlineQueries: botInfo.bot.supports_inline_queries
      },
      channel: {
        id: botInfo.channelId,
        configured: !!process.env.CHANNEL_ID
      },
      environment: {
        botTokenConfigured: !!process.env.BOT_TOKEN,
        channelIdConfigured: !!process.env.CHANNEL_ID
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Health check error:', error);
    
    return res.status(503).json({
      success: false,
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};
