const { getBotInstance } = require('../lib/telegramBot');
const { storeTemporaryUrl } = require('../lib/tempStorage');

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
    console.log('Update command called with method:', req.method);
    console.log('Update command body:', req.body);
    
    // Only allow POST requests
    if (req.method !== 'POST') {
      return res.status(405).json({
        success: false,
        error: 'Method not allowed',
        allowedMethods: ['POST']
      });
    }
    
    const { chatId, userId, downloadUrl, action } = req.body;
    
    if (!chatId || !userId) {
      return res.status(400).json({
        success: false,
        error: 'chatId and userId are required'
      });
    }
    
    const bot = getBotInstance();
    
    if (action === 'initiate_update') {
      // Initiate update command
      if (!downloadUrl) {
        return res.status(400).json({
          success: false,
          error: 'downloadUrl is required for update initiation'
        });
      }
      
      const result = await handleUpdateCommand(bot, chatId, userId, downloadUrl);
      return res.status(200).json(result);
      
    } else if (action === 'send_push') {
      // Send push notifications
      const result = await sendPushNotificationToAllUsers(bot, chatId, userId, downloadUrl);
      return res.status(200).json(result);
      
    } else if (action === 'cancel_update') {
      // Cancel update
      await bot.sendMessage(chatId, '❌ Envoi annulé.');
      return res.status(200).json({
        success: true,
        message: 'Update cancelled'
      });
    }
    
    return res.status(400).json({
      success: false,
      error: 'Invalid action'
    });
    
  } catch (error) {
    console.error('Error in update command:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Fonction pour vérifier les permissions admin
async function checkAdminPermissions(userId) {
  // IDs des administrateurs
  const ADMIN_IDS = [
    6968736907, // ID admin principal
    // Ajoutez d'autres IDs admin si nécessaire
  ];
  return ADMIN_IDS.includes(parseInt(userId));
}

// Gestion de la commande /update
async function handleUpdateCommand(bot, chatId, userId, downloadUrl) {
  try {
    // Vérifier si l'utilisateur est admin/créateur
    const isAdmin = await checkAdminPermissions(userId);
    if (!isAdmin) {
      await bot.sendMessage(chatId, '❌ Vous n\'avez pas les permissions pour cette commande.');
      return {
        success: false,
        error: 'Insufficient permissions'
      };
    }

    // Valider l'URL APKPure
    if (!downloadUrl.includes('apkpure.com')) {
      await bot.sendMessage(chatId, '❌ Veuillez fournir une URL APKPure valide.');
      return {
        success: false,
        error: 'Invalid APKPure URL'
      };
    }

    // Stocker l'URL temporairement pour éviter les limites callback_data
    const urlId = storeTemporaryUrl(downloadUrl);
    
    // Message de confirmation
    const confirmMessage = `🚀 ENVOYER NOTIFICATION MISE À JOUR\n\n` +
                          `📱 Lien: ${downloadUrl}\n` +
                          `📲 Tous les utilisateurs avec l'app recevront une notification push\n\n` +
                          `Confirmer l'envoi ?`;
    
    await bot.sendMessage(chatId, confirmMessage, {
      reply_markup: {
        inline_keyboard: [[
          { text: '✅ Envoyer notification', callback_data: `push_${urlId}` },
          { text: '❌ Annuler', callback_data: 'cancel_update' }
        ]]
      }
    });

    return {
      success: true,
      message: 'Update confirmation sent'
    };

  } catch (error) {
    console.error('Erreur commande /update:', error);
    await bot.sendMessage(chatId, '❌ Erreur lors de la préparation de la notification.');
    return {
      success: false,
      error: error.message
    };
  }
}

// Fonction d'envoi des notifications push
async function sendPushNotificationToAllUsers(bot, chatId, userId, downloadUrl) {
  try {
    // Vérifier les permissions admin
    const isAdmin = await checkAdminPermissions(userId);
    if (!isAdmin) {
      return {
        success: false,
        error: 'Insufficient permissions'
      };
    }

    await bot.sendMessage(chatId, '📲 ENVOI NOTIFICATIONS PUSH EXPO...');

    // Message de notification push
    const pushMessage = {
      title: '🚀 ATOMIC FLIX - Mise à jour disponible !',
      body: 'Nouvelles fonctionnalités et améliorations vous attendent ! Téléchargez la dernière version sur APKPure.',
      data: {
        type: 'app_update',
        downloadUrl: downloadUrl,
        action: 'download'
      }
    };

    // Utiliser le système Expo Push réel
    const { sendExpoPushNotification, isExpoConfigured } = require('./expo-push');
    
    let notificationResult;
    if (isExpoConfigured()) {
      // Envoyer de vraies notifications Expo
      notificationResult = await sendExpoPushNotification(pushMessage, pushMessage.data);
    } else {
      // Fallback : simulation si Expo non configuré
      notificationResult = await triggerPushNotifications(pushMessage);
    }

    // Rapport final
    const sentCount = notificationResult.sent || notificationResult.notificationsSent || 0;
    const report = `✅ NOTIFICATIONS ENVOYÉES\n\n` +
                  `💬 Titre: ${pushMessage.title}\n` +
                  `📝 Message: ${pushMessage.body}\n` +
                  `🔗 Lien: ${downloadUrl}\n` +
                  `📲 Notifications: ${sentCount}\n` +
                  `${notificationResult.errors ? `❌ Erreurs: ${notificationResult.errors}\n` : ''}` +
                  `📅 ${new Date().toLocaleString('fr-FR')}`;

    await bot.sendMessage(chatId, report);

    return {
      success: true,
      notificationsSent: sentCount,
      report: report
    };

  } catch (error) {
    console.error('Erreur envoi notifications:', error);
    await bot.sendMessage(chatId, `❌ Erreur: ${error.message}`);
    return {
      success: false,
      error: error.message
    };
  }
}

// Fonction pour déclencher les notifications push
async function triggerPushNotifications(pushMessage) {
  try {
    // Récupérer les tokens push stockés
    const registerPushToken = require('./register-push-token');
    
    // Simuler une requête pour obtenir les statistiques
    const mockReq = { body: { action: 'get_stats' } };
    const mockRes = {
      status: () => ({
        json: (data) => data
      })
    };
    
    // Note: Dans une vraie implémentation, vous devriez utiliser une base de données
    // pour stocker et récupérer les tokens push des utilisateurs
    
    console.log('Push notification fallback - no Expo configuration found');
    console.log('Push message:', pushMessage);
    
    return {
      sent: 0,
      error: 'No Expo configuration - notifications not sent'
    };
  } catch (error) {
    console.error('Erreur push notifications:', error);
    return {
      sent: 0,
      error: error.message
    };
  }
}