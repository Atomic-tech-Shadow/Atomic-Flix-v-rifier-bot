const { getBotInstance } = require('./lib/telegramBot');

async function setupWebhook() {
  try {
    const bot = getBotInstance();
    const webhookUrl = 'https://atomic-flix-verifier-bot.vercel.app/api/webhook';
    
    console.log('Setting up webhook...');
    console.log('Webhook URL:', webhookUrl);
    
    // Set webhook
    const result = await bot.setWebHook(webhookUrl);
    console.log('Webhook set successfully:', result);
    
    // Verify webhook
    const webhookInfo = await bot.getWebHookInfo();
    console.log('Webhook info:', webhookInfo);
    
    // Set bot commands
    const commands = [
      {
        command: 'start',
        description: '🎬 Démarrer le bot ATOMIC FLIX'
      },
      {
        command: 'verify',
        description: '✅ Vérifier votre abonnement au canal'
      },
      {
        command: 'help',
        description: '❓ Afficher l\'aide et les commandes'
      }
    ];
    
    await bot.setMyCommands(commands);
    console.log('Bot commands set successfully');
    
    // Test bot info
    const botInfo = await bot.getMe();
    console.log('Bot info:', botInfo);
    
  } catch (error) {
    console.error('Error setting up webhook:', error);
  }
}

setupWebhook();