const messageStorage = require('../lib/memoryStorage');

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
    console.log('Send app message called with method:', req.method);
    console.log('Send app message body:', req.body);
    
    // Only allow POST requests
    if (req.method !== 'POST') {
      return res.status(405).json({
        success: false,
        error: 'Method not allowed',
        allowedMethods: ['POST']
      });
    }
    
    const { appId, message } = req.body;
    
    if (!appId || !message) {
      return res.status(400).json({
        success: false,
        error: 'appId and message are required'
      });
    }
    
    // Ajouter le message via le système de stockage partagé
    const savedMessage = messageStorage.addMessage(appId, message);
    
    return res.status(200).json({ 
      success: true,
      message: 'Message sent successfully',
      messageId: savedMessage.id
    });
    
  } catch (error) {
    console.error('Error in send app message:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};