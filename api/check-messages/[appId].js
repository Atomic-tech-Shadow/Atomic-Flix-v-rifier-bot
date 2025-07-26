const messageStorage = require('../../lib/simpleStorage');

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
    // Vercel dynamic routes - appId depuis les query params, Express.js - depuis params
    const appId = req.query.appId || req.params.appId;
    
    if (!appId) {
      return res.status(400).json({
        success: false,
        error: 'appId parameter is required'
      });
    }
    
    // Récupérer les messages valides
    const validMessages = await messageStorage.getValidMessages(appId);
    
    // Nettoyer après envoi si il y a des messages
    if (validMessages.length > 0) {
      await messageStorage.clearMessages(appId);
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