const { getBotInstance } = require('./lib/telegramBot');

async function testPublicWelcome() {
  console.log('🧪 Test du message de bienvenue public dans le canal...');
  
  try {
    const bot = getBotInstance();
    
    // Simuler un nouveau membre (vous pouvez changer ces informations)
    const testUser = {
      id: 123456789,
      first_name: 'TestUser',
      username: 'testuser'
    };
    
    const channelId = '@Atomic_flix_officiel';
    const firstName = testUser.first_name || 'Nouveau membre';
    
    // Message de bienvenue public
    const welcomeMessage = 
      `🎉 Bienvenue sur ATOMIC FLIX, ${firstName} !\n\n` +
      `🍿 Félicitations ! Vous venez de rejoindre la plus grande communauté d'animes francophone.\n\n` +
      `✨ Votre accès premium inclut :\n` +
      `• 🎌 Animes en exclusivité\n` +
      `• 📺 Épisodes en haute qualité\n` +
      `• 🔄 Mises à jour quotidiennes\n` +
      `• 💬 Communauté otaku active de +1000 membres\n\n` +
      `🚀 Pour commencer :\n` +
      `• Explorez notre catalogue avec /anime\n` +
      `• Vérifiez votre statut avec /status\n` +
      `• Découvrez les avantages avec /premium\n\n` +
      `🎁 Bonus de bienvenue :\n` +
      `Accès immédiat à tous nos contenus anime premium !\n\n` +
      `Merci de nous faire confiance ! 🙏`;
    
    console.log('📤 Envoi du message public dans le canal...');
    
    // Envoyer le message publiquement dans le canal
    await bot.sendMessage(channelId, welcomeMessage, {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: '🍿 Découvrir les animes',
              callback_data: 'welcome_anime'
            },
            {
              text: '📊 Mon statut premium',
              callback_data: 'verify_subscription'
            }
          ],
          [
            {
              text: '🎬 Rejoindre la communauté',
              url: 'https://t.me/Atomic_flix_officiel'
            }
          ]
        ]
      }
    });
    
    console.log('✅ Message de bienvenue public envoyé avec succès !');
    console.log('📍 Vérifiez le canal @Atomic_flix_officiel pour voir le message');
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi du message public:', error);
    
    if (error.code === 403) {
      console.log('🚫 Le bot n\'a pas les permissions pour envoyer des messages dans le canal');
      console.log('💡 Solution: Ajoutez le bot comme admin du canal @Atomic_flix_officiel');
    } else if (error.code === 400) {
      console.log('⚠️ Mauvaise requête - le canal n\'existe peut-être pas ou le bot n\'y a pas été ajouté');
    } else {
      console.log(`Error code: ${error.code}, message: ${error.message}`);
    }
  }
}

// Exécuter le test
testPublicWelcome();