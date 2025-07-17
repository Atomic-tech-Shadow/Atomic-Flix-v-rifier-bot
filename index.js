
module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  res.status(200).json({
    message: 'ATOMIC FLIX Telegram Backend API',
    version: '2.0.0',
    status: 'online',
    bot: {
      name: 'Atomic_flix_verifier_bot',
      channel: '@Atomic_flix_officiel'
    },
    endpoints: {
      health: 'GET /api/health',
      verifySubscription: 'POST /api/verify-subscription',
      botInfo: 'GET /api/bot-info'
    },
    timestamp: new Date().toISOString()
  });
};
