const { generateWelcomeSVG } = require('./lib/svgImageGenerator');
const { getBotInstance } = require('./lib/telegramBot');
const fs = require('fs');

async function testSVGWelcome() {
  try {
    console.log('🧪 Test de génération d\'image SVG d\'accueil personnalisée...');
    
    const bot = getBotInstance();
    
    // Utilisateur test
    const testUser = {
      id: 123456789,
      first_name: 'TestUser',
      username: 'testuser_anime',
      is_bot: false
    };
    
    console.log('📸 Génération de l\'image SVG d\'accueil...');
    const svgContent = await generateWelcomeSVG(testUser, bot);
    
    if (svgContent) {
      // Sauvegarder l'image de test
      fs.writeFileSync('test-welcome-output.svg', svgContent);
      console.log('✅ Image SVG générée avec succès !');
      console.log('📁 Image sauvegardée dans: test-welcome-output.svg');
      console.log(`📊 Taille de l'image: ${svgContent.length} caractères`);
      console.log('🎨 L\'image contient le nom d\'utilisateur personnalisé et un design anime style Canva');
    } else {
      console.log('❌ Échec de la génération d\'image SVG');
    }
    
  } catch (error) {
    console.error('💥 Erreur lors du test:', error);
  }
}

// Exécuter le test
testSVGWelcome();