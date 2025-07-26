const { getBotInstance } = require('../lib/telegramBot');
const axios = require('axios');

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
    
    const { chatId, userId, title, message, downloadUrl } = req.body;
    
    if (!chatId || !userId) {
      return res.status(400).json({
        success: false,
        error: 'chatId and userId are required'
      });
    }
    
    if (!title || !message) {
      return res.status(400).json({
        success: false,
        error: 'title and message are required'
      });
    }
    
    const bot = getBotInstance();
    const result = await handleMessageCommand(bot, chatId, userId, title, message, downloadUrl);
    return res.status(200).json(result);
    
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

// Gestion de la nouvelle commande /message
async function handleMessageCommand(bot, chatId, userId, title, message, downloadUrl) {
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

    // Préparer le message pour l'app
    const appMessage = {
      title: title,
      message: message,
      downloadUrl: downloadUrl || null,
      buttonText: downloadUrl ? '📥 Télécharger' : 'OK'
    };

    try {
      // Envoyer à l'API serveur (utiliser l'endpoint local)
      const apiUrl = process.env.API_URL || 'http://localhost:5000';
      await axios.post(`${apiUrl}/api/send-app-message`, {
        appId: 'atomic_flix_mobile_v1',
        message: appMessage
      });

      // Confirmation à l'admin
      const confirmMessage = `✅ Message envoyé à toutes les apps ATOMIC FLIX\n\n` +
                            `📝 Titre: ${title}\n` +
                            `💬 Message: ${message}` +
                            `${downloadUrl ? `\n🔗 Lien: ${downloadUrl}` : ''}`;
      
      await bot.sendMessage(chatId, confirmMessage);

      return {
        success: true,
        message: 'Message sent to all apps'
      };

    } catch (apiError) {
      console.error('Erreur API envoi message:', apiError);
      await bot.sendMessage(chatId, '❌ Erreur lors de l\'envoi du message à l\'API.');
      return {
        success: false,
        error: 'API error'
      };
    }

  } catch (error) {
    console.error('Erreur commande message:', error);
    await bot.sendMessage(chatId, '❌ Erreur lors de l\'envoi du message.');
    return {
      success: false,
      error: error.message
    };
  }
}