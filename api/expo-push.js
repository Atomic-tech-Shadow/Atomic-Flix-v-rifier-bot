// API pour gérer les notifications push Expo

const { getBotInstance } = require('../lib/telegramBot');

// Configuration Expo Push
let EXPO_ACCESS_TOKEN = null;
const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

// Stockage temporaire des tokens push des utilisateurs
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
    const { action, expoToken, userId, userPushToken, message, data } = req.body;
    
    if (action === 'set_expo_token') {
      // Configurer le token Expo principal
      if (!expoToken) {
        return res.status(400).json({
          success: false,
          error: 'Expo access token is required'
        });
      }
      
      EXPO_ACCESS_TOKEN = expoToken;
      console.log('✅ Expo access token configured');
      
      return res.status(200).json({
        success: true,
        message: 'Expo access token configured successfully',
        configured: true
      });
      
    } else if (action === 'register_user_token') {
      // Enregistrer le token push d'un utilisateur
      if (!userId || !userPushToken) {
        return res.status(400).json({
          success: false,
          error: 'userId and userPushToken are required'
        });
      }
      
      // Valider le format du token Expo
      if (!userPushToken.startsWith('ExponentPushToken[') && !userPushToken.startsWith('ExpoPushToken[')) {
        return res.status(400).json({
          success: false,
          error: 'Invalid Expo push token format'
        });
      }
      
      userPushTokens.set(userId, userPushToken);
      console.log(`✅ Registered push token for user ${userId}`);
      
      return res.status(200).json({
        success: true,
        message: 'User push token registered successfully',
        userId: userId,
        registered: true
      });
      
    } else if (action === 'send_push') {
      // Envoyer une notification push
      if (!EXPO_ACCESS_TOKEN) {
        return res.status(400).json({
          success: false,
          error: 'Expo access token not configured'
        });
      }
      
      const result = await sendExpoPushNotification(message, data);
      return res.status(200).json(result);
      
    } else if (action === 'get_stats') {
      // Statistiques du système push
      return res.status(200).json({
        success: true,
        stats: {
          expoTokenConfigured: !!EXPO_ACCESS_TOKEN,
          registeredUsers: userPushTokens.size,
          registeredTokens: Array.from(userPushTokens.keys())
        }
      });
    }
    
    return res.status(400).json({
      success: false,
      error: 'Invalid action'
    });
    
  } catch (error) {
    console.error('Error in expo-push:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Fonction pour envoyer une notification push Expo
async function sendExpoPushNotification(message, data = {}) {
  try {
    if (!EXPO_ACCESS_TOKEN) {
      throw new Error('Expo access token not configured');
    }
    
    // Obtenir les tokens actifs depuis l'API d'enregistrement
    const { getActivePushTokens } = require('./register-push-token');
    const tokens = getActivePushTokens();
    
    if (tokens.length === 0) {
      return {
        success: true,
        message: 'No active users registered for push notifications',
        sent: 0,
        simulation: true
      };
    }
    const notifications = tokens.map(token => ({
      to: token,
      title: message.title || '🚀 ATOMIC FLIX',
      body: message.body || 'Nouvelle mise à jour disponible!',
      data: data || {},
      sound: 'default',
      priority: 'high'
    }));
    
    console.log(`📱 Sending ${notifications.length} push notifications...`);
    
    const response = await fetch(EXPO_PUSH_URL, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${EXPO_ACCESS_TOKEN}`
      },
      body: JSON.stringify(notifications)
    });
    
    const result = await response.json();
    
    if (response.ok) {
      const successCount = result.data?.filter(r => r.status === 'ok')?.length || 0;
      const errorCount = result.data?.filter(r => r.status === 'error')?.length || 0;
      
      console.log(`✅ Push notifications sent: ${successCount} success, ${errorCount} errors`);
      
      return {
        success: true,
        message: 'Push notifications sent successfully',
        sent: successCount,
        errors: errorCount,
        details: result.data
      };
    } else {
      console.error('❌ Expo push error:', result);
      return {
        success: false,
        error: 'Failed to send push notifications',
        details: result
      };
    }
    
  } catch (error) {
    console.error('Error sending push notification:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Exporter les fonctions utilitaires
module.exports.sendExpoPushNotification = sendExpoPushNotification;
module.exports.getUserPushTokens = () => Array.from(userPushTokens.entries());
module.exports.isExpoConfigured = () => !!EXPO_ACCESS_TOKEN;