
const { getBotInstance } = require('./lib/telegramBot');

async function configureWebhook() {
  try {
    const bot = getBotInstance();
    const webhookUrl = 'https://atomic-flix-verifier-bot.vercel.app/api/webhook';
    
    console.log('🔧 Configuration du webhook Telegram...');
    console.log('URL:', webhookUrl);
    
    // Supprimer l'ancien webhook
    await bot.deleteWebhook();
    console.log('✅ Ancien webhook supprimé');
    
    // Configurer le nouveau webhook
    const result = await bot.setWebhook(webhookUrl);
    console.log('✅ Nouveau webhook configuré:', result);
    
    // Vérifier le webhook
    const webhookInfo = await bot.getWebhookInfo();
    console.log('📡 Informations du webhook:', webhookInfo);
    
    if (webhookInfo.url === webhookUrl) {
      console.log('🎉 Webhook configuré avec succès !');
      console.log('Les commandes Telegram fonctionneront maintenant via Vercel');
    } else {
      console.log('❌ Erreur de configuration du webhook');
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de la configuration:', error);
  }
}

configureWebhook();
