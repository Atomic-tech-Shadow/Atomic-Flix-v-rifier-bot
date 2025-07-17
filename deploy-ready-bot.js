const { getBotInstance } = require('./lib/telegramBot');

// Configuration du bot pour déploiement
const BOT_CONFIG = {
  webhook_url: process.env.WEBHOOK_URL || 'https://atomic-flix-verifier-bot.vercel.app/api/webhook',
  bot_token: process.env.BOT_TOKEN || '8136643576:AAEIwUDrBN_0LOn2eqQZdzhZZuFzaGgfNwg',
  channel_id: process.env.CHANNEL_ID || '@Atomic_flix_officiel'
};

async function setupBotForDeployment() {
  try {
    console.log('🚀 Configuration du bot pour déploiement...');
    
    const bot = getBotInstance();
    
    // 1. Supprimer l'ancien webhook
    await bot.deleteWebHook();
    console.log('✅ Ancien webhook supprimé');
    
    // 2. Configurer le nouveau webhook
    const webhookResult = await bot.setWebHook(BOT_CONFIG.webhook_url);
    console.log('✅ Nouveau webhook configuré:', webhookResult);
    
    // 3. Configurer les commandes du bot
    const commands = [
      {
        command: 'start',
        description: '🎬 Démarrer le bot ATOMIC FLIX'
      },
      {
        command: 'verify',
        description: '✅ Vérifier votre abonnement'
      },
      {
        command: 'help',
        description: '❓ Obtenir de l\'aide'
      }
    ];
    
    await bot.setMyCommands(commands);
    console.log('✅ Commandes configurées');
    
    // 4. Configurer la description du bot
    await bot.setMyDescription('🎬 Bot officiel ATOMIC FLIX pour vérifier les abonnements au canal @Atomic_flix_officiel');
    console.log('✅ Description configurée');
    
    // 5. Vérifier la configuration
    const botInfo = await bot.getMe();
    const webhookInfo = await bot.getWebHookInfo();
    
    console.log('\n📋 Configuration finale:');
    console.log('Bot:', botInfo.username);
    console.log('Webhook:', webhookInfo.url);
    console.log('Canal:', BOT_CONFIG.channel_id);
    
    if (webhookInfo.last_error_message) {
      console.log('⚠️ Dernière erreur:', webhookInfo.last_error_message);
    }
    
    console.log('\n✅ Bot prêt pour déploiement!');
    console.log('🔗 Testez votre bot: https://t.me/Atomic_flix_verifier_bot');
    
  } catch (error) {
    console.error('❌ Erreur configuration:', error);
  }
}

// Exécuter si appelé directement
if (require.main === module) {
  setupBotForDeployment();
}

module.exports = { setupBotForDeployment, BOT_CONFIG };