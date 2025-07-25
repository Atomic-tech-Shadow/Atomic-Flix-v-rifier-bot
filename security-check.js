const TelegramBot = require('node-telegram-bot-api');

// Vérifier l'état de sécurité du bot
async function checkBotSecurity() {
  const token = '8136643576:AAEIwUDrBN_0LOn2eqQZdzhZZuFzaGgfNwg';
  const bot = new TelegramBot(token, { polling: false });
  
  try {
    console.log('=== VÉRIFICATION DE SÉCURITÉ DU BOT ===\n');
    
    // 1. Informations du bot
    const me = await bot.getMe();
    console.log('1. Informations du bot:');
    console.log(`ID: ${me.id}`);
    console.log(`Nom: ${me.username}`);
    console.log(`Nom complet: ${me.first_name}`);
    console.log(`Bot: ${me.is_bot}\n`);
    
    // 2. Statut du webhook
    const webhookInfo = await bot.getWebhookInfo();
    console.log('2. Statut du webhook:');
    console.log(`URL: ${webhookInfo.url || 'AUCUN WEBHOOK CONFIGURÉ'}`);
    console.log(`Certificat personnalisé: ${webhookInfo.has_custom_certificate}`);
    console.log(`Mises à jour en attente: ${webhookInfo.pending_update_count}`);
    console.log(`Dernière erreur: ${webhookInfo.last_error_message || 'Aucune'}`);
    console.log(`Date dernière erreur: ${webhookInfo.last_error_date || 'Aucune'}\n`);
    
    // 3. Commandes configurées
    const commands = await bot.getMyCommands();
    console.log('3. Commandes configurées:');
    commands.forEach(cmd => {
      console.log(`/${cmd.command} - ${cmd.description}`);
    });
    
    // 4. Supprimer tout webhook externe
    console.log('\n4. Suppression des webhooks externes...');
    await bot.deleteWebhook();
    console.log('✅ Webhooks supprimés');
    
    // 5. Réinitialiser les commandes
    console.log('\n5. Réinitialisation des commandes...');
    const newCommands = [
      { command: 'start', description: '🎬 Démarrer le bot ATOMIC FLIX' },
      { command: 'verify', description: '✅ Vérifier votre abonnement au canal' },
      { command: 'help', description: '❓ Afficher aide et commandes' }
    ];
    
    await bot.setMyCommands(newCommands);
    console.log('✅ Commandes réinitialisées');
    
  } catch (error) {
    console.error('Erreur lors de la vérification:', error);
  }
}

checkBotSecurity();