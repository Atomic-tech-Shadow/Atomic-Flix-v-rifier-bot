const { generateWelcomeImage } = require('./lib/imageGenerator');
const { getBotInstance } = require('./lib/telegramBot');
const fs = require('fs');

async function testWelcomeImage() {
  try {
    console.log('🧪 Test de génération d\'image d\'accueil personnalisée...');
    
    const bot = getBotInstance();
    
    // Utilisateur test
    const testUser = {
      id: 123456789,
      first_name: 'Test',
      username: 'testuser',
      is_bot: false
    };
    
    console.log('📸 Génération de l\'image d\'accueil...');
    const imageBuffer = await generateWelcomeImage(testUser, bot);
    
    if (imageBuffer) {
      // Sauvegarder l'image de test
      fs.writeFileSync('test-welcome-output.png', imageBuffer);
      console.log('✅ Image générée avec succès !');
      console.log('📁 Image sauvegardée dans: test-welcome-output.png');
      console.log(`📊 Taille de l'image: ${imageBuffer.length} bytes`);
    } else {
      console.log('❌ Échec de la génération d\'image');
    }
    
  } catch (error) {
    console.error('💥 Erreur lors du test:', error);
  }
}

// Exécuter le test
testWelcomeImage();