const { getBotInstance } = require('./lib/telegramBot');

async function addMoreCommands() {
  try {
    console.log('🔧 Ajout de commandes supplémentaires...');
    
    const bot = getBotInstance();
    
    // Commandes étendues pour ATOMIC FLIX
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
      },
      {
        command: 'anime',
        description: '🍿 Découvrir les nouveaux animes'
      },
      {
        command: 'movies',
        description: '🎭 Films et séries disponibles'
      },
      {
        command: 'channel',
        description: '📱 Rejoindre le canal officiel'
      },
      {
        command: 'status',
        description: '📊 Statut de votre abonnement'
      },
      {
        command: 'about',
        description: '📖 À propos d\'ATOMIC FLIX'
      },
      {
        command: 'support',
        description: '🆘 Support et assistance'
      },
      {
        command: 'premium',
        description: '💎 Avantages premium'
      }
    ];
    
    await bot.setMyCommands(commands);
    console.log('✅ Commandes étendues configurées');
    
    // Vérifier les commandes configurées
    const currentCommands = await bot.getMyCommands();
    console.log('\n📋 Commandes disponibles:');
    currentCommands.forEach((cmd, index) => {
      console.log(`${index + 1}. /${cmd.command} - ${cmd.description}`);
    });
    
    console.log(`\n✅ Total: ${currentCommands.length} commandes configurées`);
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'ajout des commandes:', error);
  }
}

addMoreCommands();