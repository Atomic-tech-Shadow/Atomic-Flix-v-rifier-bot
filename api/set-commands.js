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
    console.log('Set commands request');
    
    // Only allow POST requests
    if (req.method !== 'POST') {
      return res.status(405).json({
        success: false,
        error: 'Method not allowed',
        allowedMethods: ['POST']
      });
    }
    
    const bot = getBotInstance();
    
    // Define bot commands
    const commands = [
      {
        command: 'start',
        description: '🎬 Démarrer le bot ATOMIC FLIX'
      },
      {
        command: 'verify',
        description: '✅ Vérifier votre abonnement au canal'
      },
      {
        command: 'help',
        description: '❓ Afficher l\'aide et les commandes'
      },
      {
        command: 'update',
        description: '📱 Envoyer une notification de mise à jour'
      }
    ];
    
    // Set commands for the bot
    const result = await bot.setMyCommands(commands);
    
    console.log('Bot commands set successfully');
    
    return res.status(200).json({
      success: true,
      message: 'Bot commands configured successfully',
      commands: commands,
      telegramResult: result,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Set commands error:', error);
    
    return res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};