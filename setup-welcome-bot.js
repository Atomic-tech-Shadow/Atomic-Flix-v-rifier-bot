const { getBotInstance } = require('./lib/telegramBot');

async function setupWelcomeBot() {
  try {
    console.log('🎉 Configuration du système de bienvenue...');
    
    const bot = getBotInstance();
    
    // Configuration du webhook pour détecter les nouveaux membres
    const webhookUrl = 'https://atomic-flix-verifier-bot.vercel.app/api/webhook';
    
    // Supprimer l'ancien webhook
    await bot.deleteWebHook();
    console.log('✅ Ancien webhook supprimé');
    
    // Configurer le nouveau webhook avec les permissions étendues
    await bot.setWebHook(webhookUrl, {
      allowed_updates: [
        'message',
        'callback_query', 
        'my_chat_member',
        'chat_member',
        'channel_post'
      ]
    });
    console.log('✅ Webhook configuré avec détection des nouveaux membres');
    
    // Vérifier la configuration
    const webhookInfo = await bot.getWebHookInfo();
    console.log('📋 Webhook info:', webhookInfo.url);
    console.log('📋 Allowed updates:', webhookInfo.allowed_updates);
    
    // Test des permissions du bot
    const botInfo = await bot.getMe();
    console.log('🤖 Bot:', botInfo.username);
    
    console.log('\n🎉 Système de bienvenue configuré !');
    console.log('💡 Le bot enverra maintenant un message de bienvenue personnalisé à chaque nouveau membre qui rejoint @Atomic_flix_officiel');
    
    console.log('\n📝 Fonctionnalités de bienvenue :');
    console.log('• Message personnel avec nom de l\'utilisateur');
    console.log('• Présentation des avantages premium');
    console.log('• Boutons interactifs pour découvrir le contenu');
    console.log('• Liens directs vers les fonctionnalités');
    console.log('• Gestion des utilisateurs qui bloquent les messages privés');
    
  } catch (error) {
    console.error('❌ Erreur configuration bienvenue:', error);
  }
}

setupWelcomeBot();