const { getBotInstance } = require('./lib/telegramBot');
const { generateWelcomeSVG } = require('./lib/svgImageGenerator');

async function testPublicWelcomeMessage() {
  try {
    console.log('🧪 Test du message d\'accueil PUBLIC avec logo ATOMIC FLIX...');
    
    const bot = getBotInstance();
    const channelId = '@Atomic_flix_officiel';
    
    // Simuler un nouvel utilisateur qui rejoint
    const newUser = {
      id: 123456789,
      first_name: 'TestUser',
      username: 'testuser_anime',
      is_bot: false
    };
    
    console.log('📸 Génération de l\'image d\'accueil avec logo rond...');
    const svgContent = await generateWelcomeSVG(newUser, bot);
    
    if (svgContent) {
      console.log('✅ Image SVG générée avec logo ATOMIC FLIX rond !');
      console.log('📊 Taille de l\'image:', svgContent.length, 'caractères');
      
      // Message d'accueil optimisé
      const welcomeMessage = `🎉 ATOMIC FLIX vous souhaite la bienvenue @${newUser.username || newUser.first_name} ! 

Merci de rejoindre notre communauté anime 🎌
Découvrez +1000 animes en qualité HD avec des mises à jour quotidiennes !

🔥 Fonctionnalités exclusives :
• Streaming HD sans pub
• Nouvelles sorties chaque jour  
• Communauté active d'otakus
• Recommandations personnalisées

Bon visionnage sur ATOMIC FLIX ! ✨`;

      console.log('💬 Message d\'accueil prêt :');
      console.log(welcomeMessage);
      console.log('');
      console.log('🎨 Logo rond intégré : Atome stylisé + Triangle "FLIX" + Lettre F néon');
      console.log('📍 Destination : Canal PUBLIC @Atomic_flix_officiel');
      console.log('✅ Système de fallback configuré si image échoue');
      
    } else {
      console.log('❌ Échec de la génération d\'image - fallback text sera utilisé');
    }
    
  } catch (error) {
    console.error('💥 Erreur lors du test:', error);
  }
}

// Exécuter le test
testPublicWelcomeMessage();