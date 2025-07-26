const messageStorage = require('../lib/messageStorage');

module.exports = async (req, res) => {
  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    return res.status(200).json({});
  }
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  
  try {
    // Pour Vercel, récupérer appId depuis l'URL ou les query params
    let appId;
    
    // Essayer de récupérer depuis l'URL path (ex: /api/check-messages/atomic_flix_mobile_v1)
    if (req.url) {
      const urlParts = req.url.split('/');
      const checkMessagesIndex = urlParts.findIndex(part => part === 'check-messages');
      if (checkMessagesIndex !== -1 && urlParts[checkMessagesIndex + 1]) {
        appId = urlParts[checkMessagesIndex + 1].split('?')[0]; // Enlever les query params
      }
    }
    
    // Sinon essayer les query params
    if (!appId && req.query && req.query.appId) {
      appId = req.query.appId;
    }
    
    if (!appId) {
      return res.status(400).json({
        success: false,
        error: 'appId parameter is required. Use /api/check-messages/YOUR_APP_ID or ?appId=YOUR_APP_ID'
      });
    }
    
    // Récupérer les messages valides
    const validMessages = messageStorage.getValidMessages(appId);
    
    // Nettoyer après envoi si il y a des messages
    if (validMessages.length > 0) {
      messageStorage.clearMessages(appId);
    }
    
    console.log(`📱 App ${appId} a vérifié les messages: ${validMessages.length} trouvés`);
    
    return res.status(200).json({ 
      success: true,
      messages: validMessages 
    });
    
  } catch (error) {
    console.error('Error in check messages:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};