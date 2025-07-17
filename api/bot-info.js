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
    console.log('Bot info detailed request');
    
    // Only allow GET requests
    if (req.method !== 'GET') {
      return res.status(405).json({
        success: false,
        error: 'Method not allowed',
        allowedMethods: ['GET']
      });
    }
    
    const bot = getBotInstance();
    
    // Get comprehensive bot information
    const [botInfo, commands] = await Promise.all([
      bot.getMe(),
      bot.getMyCommands()
    ]);
    
    // Default webhook info (getWebhookInfo may not be available in all versions)
    const webhookInfo = {
      url: '',
      has_custom_certificate: false,
      pending_update_count: 0,
      last_error_date: null,
      last_error_message: null,
      max_connections: 40,
      allowed_updates: []
    };
    
    console.log('Bot detailed info retrieved successfully');
    
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
        url: webhookInfo.url || '',
        hasCustomCertificate: webhookInfo.has_custom_certificate || false,
        pendingUpdateCount: webhookInfo.pending_update_count || 0,
        lastErrorDate: webhookInfo.last_error_date || null,
        lastErrorMessage: webhookInfo.last_error_message || null,
        maxConnections: webhookInfo.max_connections || 40,
        allowedUpdates: webhookInfo.allowed_updates || [],
        isPolling: !webhookInfo.url || webhookInfo.url === ''
      },
      channel: {
        id: process.env.CHANNEL_ID || '@Atomic_flix_officiel',
        configured: true
      },
      features: {
        subscriptionVerification: true,
        inlineKeyboards: true,
        webAppSupport: true,
        paymentSupport: true,
        businessIntegration: true
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Bot info detailed error:', error);
    
    return res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};