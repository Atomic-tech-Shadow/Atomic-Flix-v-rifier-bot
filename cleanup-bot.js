const { getBotInstance } = require('./lib/telegramBot');

async function cleanupBot() {
  try {
    console.log('🧹 Nettoyage du bot...');
    
    const bot = getBotInstance();
    
    // Supprimer le webhook
    await bot.deleteWebHook();
    console.log('✅ Webhook supprimé');
    
    // Vérifier l'état final
    const webhookInfo = await bot.getWebHookInfo();
    console.log('📋 État final du webhook:', webhookInfo.url || 'Aucun webhook');
    
    // Informations du bot
    const botInfo = await bot.getMe();
    console.log('🤖 Bot:', botInfo.username);
    console.log('✅ Nettoyage terminé');
    
  } catch (error) {
    console.error('❌ Erreur lors du nettoyage:', error);
  }
}

cleanupBot();