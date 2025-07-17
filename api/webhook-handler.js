const { getBotInstance } = require('../lib/telegramBot');

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
    console.log('Webhook handler called');
    
    // Only allow POST requests
    if (req.method !== 'POST') {
      return res.status(405).json({
        success: false,
        error: 'Method not allowed',
        allowedMethods: ['POST']
      });
    }
    
    const bot = getBotInstance();
    const update = req.body;
    
    console.log('Webhook update received:', JSON.stringify(update, null, 2));
    
    // Handle text messages
    if (update.message && update.message.text) {
      const chatId = update.message.chat.id;
      const text = update.message.text;
      const userId = update.message.from.id;
      
      console.log(`Message from user ${userId}: ${text}`);
      
      // Handle commands
      if (text.startsWith('/start')) {
        await bot.sendMessage(chatId, 
          `🎬 Bienvenue sur ATOMIC FLIX !\n\n` +
          `Je suis votre assistant pour vérifier votre abonnement au canal @Atomic_flix_officiel.\n\n` +
          `Utilisez /verify pour vérifier votre abonnement.`,
          {
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: '✅ Vérifier mon abonnement',
                    callback_data: 'verify_subscription'
                  }
                ],
                [
                  {
                    text: '📱 Rejoindre le canal',
                    url: 'https://t.me/Atomic_flix_officiel'
                  }
                ]
              ]
            }
          }
        );
      } else if (text.startsWith('/verify')) {
        // Check subscription status
        const { verifySubscription } = require('../lib/telegramBot');
        const result = await verifySubscription(userId.toString());
        
        if (result.isSubscribed) {
          await bot.sendMessage(chatId, 
            `✅ Parfait ! Vous êtes abonné au canal @Atomic_flix_officiel\n\n` +
            `Statut: ${result.status}\n` +
            `Vous avez accès à tous les contenus ATOMIC FLIX.`
          );
        } else {
          await bot.sendMessage(chatId, 
            `❌ Vous n'êtes pas encore abonné au canal @Atomic_flix_officiel\n\n` +
            `Pour accéder aux contenus ATOMIC FLIX, vous devez d'abord rejoindre notre canal.`,
            {
              reply_markup: {
                inline_keyboard: [
                  [
                    {
                      text: '📱 Rejoindre maintenant',
                      url: 'https://t.me/Atomic_flix_officiel'
                    }
                  ],
                  [
                    {
                      text: '🔄 Vérifier à nouveau',
                      callback_data: 'verify_subscription'
                    }
                  ]
                ]
              }
            }
          );
        }
      } else if (text.startsWith('/help')) {
        await bot.sendMessage(chatId, 
          `🤖 Commandes disponibles:\n\n` +
          `/start - Démarrer le bot\n` +
          `/verify - Vérifier votre abonnement\n` +
          `/help - Afficher cette aide\n\n` +
          `💡 Vous pouvez aussi utiliser les boutons interactifs pour naviguer plus facilement.`
        );
      }
    }
    
    // Handle callback queries (inline keyboard button presses)
    if (update.callback_query) {
      const callbackQuery = update.callback_query;
      const chatId = callbackQuery.message.chat.id;
      const userId = callbackQuery.from.id;
      const data = callbackQuery.data;
      
      console.log(`Callback query from user ${userId}: ${data}`);
      
      if (data === 'verify_subscription') {
        // Check subscription status
        const { verifySubscription } = require('../lib/telegramBot');
        const result = await verifySubscription(userId.toString());
        
        if (result.isSubscribed) {
          await bot.answerCallbackQuery(callbackQuery.id, {
            text: '✅ Vous êtes abonné !',
            show_alert: false
          });
          
          await bot.editMessageText(
            `✅ Excellent ! Vous êtes abonné au canal @Atomic_flix_officiel\n\n` +
            `Statut: ${result.status}\n` +
            `Vous avez accès à tous les contenus ATOMIC FLIX.`,
            {
              chat_id: chatId,
              message_id: callbackQuery.message.message_id
            }
          );
        } else {
          await bot.answerCallbackQuery(callbackQuery.id, {
            text: '❌ Veuillez d\'abord rejoindre le canal',
            show_alert: true
          });
        }
      }
    }
    
    return res.status(200).json({
      success: true,
      message: 'Webhook processed successfully'
    });
    
  } catch (error) {
    console.error('Webhook handler error:', error);
    
    return res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};