const { verifySubscription } = require('../lib/telegramBot');

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
    console.log('Subscription verification requested');
    
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
    
    // Parse request body
    let body;
    try {
      body = req.body;
    } catch (parseError) {
      return res.status(400).json({
        success: false,
        error: 'Invalid JSON in request body'
      });
    }
    
    // Validate required fields
    if (!body || !body.userId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: userId',
        requiredFields: ['userId']
      });
    }
    
    const { userId } = body;
    
    // Validate userId format (should be numeric string or number)
    if (typeof userId !== 'string' && typeof userId !== 'number') {
      return res.status(400).json({
        success: false,
        error: 'userId must be a string or number'
      });
    }
    
    // Convert to string for consistency
    const userIdStr = String(userId);
    
    // Validate that userId is numeric
    if (!/^\d+$/.test(userIdStr)) {
      return res.status(400).json({
        success: false,
        error: 'userId must be numeric'
      });
    }
    
    console.log(`Verifying subscription for user: ${userIdStr}`);
    
    // Verify subscription
    const result = await verifySubscription(userIdStr);
    
    // Log the result for debugging
    console.log('Subscription verification result:', {
      userId: userIdStr,
      isSubscribed: result.isSubscribed,
      status: result.status
    });
    
    // Return appropriate HTTP status based on result
    if (result.status === 'error') {
      return res.status(500).json({
        success: false,
        isSubscribed: false,
        status: result.status,
        error: result.error,
        timestamp: new Date().toISOString()
      });
    }
    
    // Success response
    return res.status(200).json({
      success: true,
      isSubscribed: result.isSubscribed,
      status: result.status,
      userInfo: result.userInfo,
      channel: {
        id: process.env.CHANNEL_ID || '@Atomic_flix_officiel'
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Subscription verification error:', error);
    
    return res.status(500).json({
      success: false,
      isSubscribed: false,
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};
