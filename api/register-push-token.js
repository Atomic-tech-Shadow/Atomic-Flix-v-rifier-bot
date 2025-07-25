// API pour enregistrer les tokens push des utilisateurs de l'app mobile
// Stockage PostgreSQL persistent - Totalement gratuit et illimité

const { getBotInstance } = require('../lib/telegramBot');
const { ExpoPushTokenManager } = require('../lib/database');



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
    console.log('Register push token request:', req.body);
    
    const { userId, pushToken, deviceInfo, action } = req.body;
    
    if (action === 'register') {
      // Enregistrer un nouveau token push
      if (!userId || !pushToken) {
        return res.status(400).json({
          success: false,
          error: 'userId and pushToken are required'
        });
      }
      
      // Valider le format du token Expo
      if (!pushToken.startsWith('ExponentPushToken[') && !pushToken.startsWith('ExpoPushToken[')) {
        return res.status(400).json({
          success: false,
          error: 'Invalid Expo push token format'
        });
      }
      
      // Stocker le token dans PostgreSQL
      const tokenData = await ExpoPushTokenManager.registerToken(userId, pushToken, deviceInfo || {});
      
      console.log(`✅ Push token registered for user ${userId}:`, pushToken.substring(0, 30) + '...');
      
      return res.status(200).json({
        success: true,
        message: 'Push token registered successfully in PostgreSQL',
        userId: userId,
        registered: true,
        timestamp: tokenData.registered_at,
        persistent: true
      });
      
    } else if (action === 'unregister') {
      // Supprimer un token push
      if (!userId) {
        return res.status(400).json({
          success: false,
          error: 'userId is required'
        });
      }
      
      const result = await ExpoPushTokenManager.unregisterToken(userId);
      
      return res.status(200).json({
        success: true,
        message: result ? 'Push token unregistered successfully' : 'No token found for user',
        userId: userId,
        unregistered: !!result,
        persistent: true
      });
      
    } else if (action === 'update_activity') {
      // Mettre à jour la dernière activité
      if (!userId) {
        return res.status(400).json({
          success: false,
          error: 'userId is required'
        });
      }
      
      const result = await ExpoPushTokenManager.updateLastActivity(userId);
      
      return res.status(200).json({
        success: true,
        message: 'Activity updated in PostgreSQL',
        found: !!result,
        persistent: true
      });
      
    } else if (action === 'get_stats') {
      // Statistiques des tokens enregistrés depuis PostgreSQL
      const stats = await ExpoPushTokenManager.getStats();
      
      return res.status(200).json({
        success: true,
        stats: {
          totalUsers: stats.totalUsers,
          activeUsers: stats.activeUsers,
          recentRegistrations: stats.recentRegistrations,
          storage: 'PostgreSQL - Unlimited & Free',
          persistent: true
        }
      });
    }
    
    return res.status(400).json({
      success: false,
      error: 'Invalid action. Use: register, unregister, update_activity, or get_stats'
    });
    
  } catch (error) {
    console.error('Error in register-push-token:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Fonction utilitaire pour obtenir tous les tokens actifs depuis PostgreSQL
async function getActivePushTokens() {
  try {
    return await ExpoPushTokenManager.getActiveTokens();
  } catch (error) {
    console.error('Error getting active push tokens:', error);
    return [];
  }
}

// Exporter les fonctions utilitaires
module.exports.getActivePushTokens = getActivePushTokens;
module.exports.getUserCount = async () => {
  try {
    const stats = await ExpoPushTokenManager.getStats();
    return stats.totalUsers;
  } catch (error) {
    console.error('Error getting user count:', error);
    return 0;
  }
};