const { getBotInstance } = require('./lib/telegramBot');

async function testBotDirectly() {
  try {
    console.log('🤖 Testing bot directly...');
    
    const bot = getBotInstance();
    
    // Test bot info
    const botInfo = await bot.getMe();
    console.log('✅ Bot info:', botInfo.username);
    
    // Remove webhook temporarily and use polling for testing
    await bot.deleteWebHook();
    console.log('✅ Webhook removed');
    
    // Start polling
    bot.startPolling();
    console.log('✅ Polling started - bot should now respond to messages');
    
    // Handle messages
    bot.onText(/\/start/, (msg) => {
      const chatId = msg.chat.id;
      bot.sendMessage(chatId, 
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
    });
    
    bot.onText(/\/verify/, async (msg) => {
      const chatId = msg.chat.id;
      const userId = msg.from.id;
      
      const { verifySubscription } = require('./lib/telegramBot');
      const result = await verifySubscription(userId.toString());
      
      if (result.isSubscribed) {
        bot.sendMessage(chatId, 
          `✅ Parfait ! Vous êtes bien abonné au canal @Atomic_flix_officiel.\n\n` +
          `Vous pouvez maintenant profiter de tous les contenus ATOMIC FLIX !`
        );
      } else {
        bot.sendMessage(chatId, 
          `❌ Vous n'êtes pas encore abonné au canal @Atomic_flix_officiel.\n\n` +
          `Veuillez vous abonner d'abord, puis utilisez /verify pour vérifier.`
        );
      }
    });
    
    // Handle callback queries
    bot.on('callback_query', async (callbackQuery) => {
      const msg = callbackQuery.message;
      const chatId = msg.chat.id;
      const userId = callbackQuery.from.id;
      
      if (callbackQuery.data === 'verify_subscription') {
        const { verifySubscription } = require('./lib/telegramBot');
        const result = await verifySubscription(userId.toString());
        
        if (result.isSubscribed) {
          bot.editMessageText(
            `✅ Parfait ! Vous êtes bien abonné au canal @Atomic_flix_officiel.\n\n` +
            `Vous pouvez maintenant profiter de tous les contenus ATOMIC FLIX !`,
            {
              chat_id: chatId,
              message_id: msg.message_id
            }
          );
        } else {
          bot.editMessageText(
            `❌ Vous n'êtes pas encore abonné au canal @Atomic_flix_officiel.\n\n` +
            `Veuillez vous abonner d'abord, puis réessayez.`,
            {
              chat_id: chatId,
              message_id: msg.message_id,
              reply_markup: {
                inline_keyboard: [
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
        }
      }
      
      bot.answerCallbackQuery(callbackQuery.id);
    });
    
    console.log('🚀 Bot is now running in polling mode');
    console.log('Test it by sending /start to @Atomic_flix_verifier_bot');
    
    // Keep the process alive
    process.on('SIGINT', () => {
      console.log('Stopping bot...');
      bot.stopPolling();
      process.exit(0);
    });
    
  } catch (error) {
    console.error('Error testing bot:', error);
  }
}

testBotDirectly();