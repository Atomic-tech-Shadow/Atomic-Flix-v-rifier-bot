// API pour enregistrer les tokens push des utilisateurs de l'app mobile

const { getBotInstance } = require('../lib/telegramBot');

// Stockage persistant des tokens (en production, utiliser une vraie DB)
const userPushTokens = new Map();



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
      
      // Stocker le token avec informations supplémentaires
      const tokenData = {
        pushToken: pushToken,
        deviceInfo: deviceInfo || {},
        registeredAt: new Date().toISOString(),
        lastActive: new Date().toISOString()
      };
      
      userPushTokens.set(userId.toString(), tokenData);
      
      console.log(`✅ Push token registered for user ${userId}:`, pushToken.substring(0, 30) + '...');
      
      return res.status(200).json({
        success: true,
        message: 'Push token registered successfully',
        userId: userId,
        registered: true,
        timestamp: tokenData.registeredAt
      });
      
    } else if (action === 'unregister') {
      // Supprimer un token push
      if (!userId) {
        return res.status(400).json({
          success: false,
          error: 'userId is required'
        });
      }
      
      const deleted = userPushTokens.delete(userId.toString());
      
      return res.status(200).json({
        success: true,
        message: deleted ? 'Push token unregistered successfully' : 'No token found for user',
        userId: userId,
        unregistered: deleted
      });
      
    } else if (action === 'update_activity') {
      // Mettre à jour la dernière activité
      if (!userId) {
        return res.status(400).json({
          success: false,
          error: 'userId is required'
        });
      }
      
      const tokenData = userPushTokens.get(userId.toString());
      if (tokenData) {
        tokenData.lastActive = new Date().toISOString();
        userPushTokens.set(userId.toString(), tokenData);
      }
      
      return res.status(200).json({
        success: true,
        message: 'Activity updated',
        found: !!tokenData
      });
      
    } else if (action === 'get_stats') {
      // Statistiques des tokens enregistrés
      const tokens = Array.from(userPushTokens.entries());
      const activeTokens = tokens.filter(([_, data]) => {
        const lastActive = new Date(data.lastActive);
        const daysSinceActive = (Date.now() - lastActive.getTime()) / (1000 * 60 * 60 * 24);
        return daysSinceActive <= 30; // Actif dans les 30 derniers jours
      });
      
      return res.status(200).json({
        success: true,
        stats: {
          totalUsers: userPushTokens.size,
          activeUsers: activeTokens.length,
          registrationDates: tokens.map(([userId, data]) => ({
            userId,
            registeredAt: data.registeredAt,
            lastActive: data.lastActive
          }))
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

// Fonction utilitaire pour obtenir tous les tokens actifs
function getActivePushTokens() {
  const tokens = Array.from(userPushTokens.values());
  return tokens
    .filter(data => {
      const lastActive = new Date(data.lastActive);
      const daysSinceActive = (Date.now() - lastActive.getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceActive <= 30; // Actif dans les 30 derniers jours
    })
    .map(data => data.pushToken);
}

// Exporter les fonctions utilitaires
module.exports.getActivePushTokens = getActivePushTokens;
module.exports.getUserCount = () => userPushTokens.size;