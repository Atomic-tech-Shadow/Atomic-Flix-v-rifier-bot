const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

/**
 * Génère une image d'accueil personnalisée avec la photo de profil de l'utilisateur
 */
async function generateWelcomeImage(user, bot) {
  try {
    // Dimensions de l'image
    const width = 800;
    const height = 400;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Fond dégradé
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(0.5, '#16213e');
    gradient.addColorStop(1, '#0f3460');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Récupérer et dessiner la photo de profil de l'utilisateur
    let userProfileImage = null;
    try {
      // Obtenir les photos de profil de l'utilisateur via l'API Telegram
      const userPhotos = await bot.getUserProfilePhotos(user.id, { limit: 1 });
      
      if (userPhotos.photos && userPhotos.photos.length > 0) {
        const photo = userPhotos.photos[0][0]; // Prendre la plus petite taille
        const fileInfo = await bot.getFile(photo.file_id);
        const photoUrl = `https://api.telegram.org/file/bot${bot.token}/${fileInfo.file_path}`;
        
        // Télécharger l'image
        const response = await axios.get(photoUrl, { responseType: 'arraybuffer' });
        const buffer = Buffer.from(response.data);
        userProfileImage = await loadImage(buffer);
      }
    } catch (error) {
      console.log('Could not load user profile image:', error.message);
    }

    // Formes décoratives
    ctx.globalAlpha = 0.1;
    ctx.fillStyle = '#ff6b6b';
    ctx.beginPath();
    ctx.arc(100, 80, 40, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#4ecdc4';
    ctx.beginPath();
    ctx.arc(700, 320, 60, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#96ceb4';
    ctx.beginPath();
    ctx.arc(650, 100, 30, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#45b7d1';
    ctx.beginPath();
    ctx.arc(150, 300, 50, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = 1;

    // Zone principale avec bordure dégradée
    ctx.strokeStyle = '#ff6b6b';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(150, 100, 500, 200, 20);
    ctx.stroke();

    // Rectangle de fond semi-transparent
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.beginPath();
    ctx.roundRect(150, 100, 500, 200, 20);
    ctx.fill();

    // Photo de profil utilisateur (si disponible)
    if (userProfileImage) {
      const profileSize = 80;
      const profileX = 200;
      const profileY = 120;

      // Cercle de fond pour la photo
      ctx.save();
      ctx.beginPath();
      ctx.arc(profileX + profileSize/2, profileY + profileSize/2, profileSize/2, 0, Math.PI * 2);
      ctx.clip();
      
      // Dessiner l'image de profil
      ctx.drawImage(userProfileImage, profileX, profileY, profileSize, profileSize);
      ctx.restore();

      // Bordure colorée autour de la photo
      ctx.strokeStyle = '#4ecdc4';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(profileX + profileSize/2, profileY + profileSize/2, profileSize/2 + 2, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Titre ATOMIC FLIX
    const titleGradient = ctx.createLinearGradient(0, 0, width, 0);
    titleGradient.addColorStop(0, '#ff6b6b');
    titleGradient.addColorStop(0.33, '#4ecdc4');
    titleGradient.addColorStop(0.66, '#45b7d1');
    titleGradient.addColorStop(1, '#96ceb4');

    ctx.fillStyle = titleGradient;
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('ATOMIC FLIX', 400, 160);

    // Sous-titre
    ctx.fillStyle = '#ffffff';
    ctx.font = '18px Arial';
    ctx.globalAlpha = 0.9;
    ctx.fillText('Communauté Anime Francophone', 400, 185);
    ctx.globalAlpha = 1;

    // Message de bienvenue avec nom d'utilisateur
    const username = user.username ? `@${user.username}` : user.first_name || 'Nouveau membre';
    ctx.fillStyle = '#4ecdc4';
    ctx.font = 'bold 22px Arial';
    ctx.fillText(`🎉 BIENVENUE ${username} ! 🎉`, 400, 220);

    // Icons des fonctionnalités
    const features = [
      { emoji: '🎌', text: '1000+ Animes', x: 220, color: '#ff6b6b' },
      { emoji: '📺', text: 'Qualité HD', x: 320, color: '#4ecdc4' },
      { emoji: '🔄', text: 'Quotidien', x: 420, color: '#45b7d1' },
      { emoji: '💬', text: 'Communauté', x: 520, color: '#96ceb4' }
    ];

    features.forEach(feature => {
      // Cercle de fond
      ctx.fillStyle = feature.color;
      ctx.globalAlpha = 0.8;
      ctx.beginPath();
      ctx.arc(feature.x, 260, 20, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;

      // Emoji
      ctx.font = '20px Arial';
      ctx.fillText(feature.emoji, feature.x, 268);

      // Texte descriptif
      ctx.fillStyle = '#ffffff';
      ctx.font = '12px Arial';
      ctx.fillText(feature.text, feature.x, 285);
    });

    // Étoiles décoratives
    ctx.font = '24px Arial';
    ctx.fillStyle = '#ff6b6b';
    ctx.globalAlpha = 0.6;
    ctx.fillText('✨', 120, 60);
    
    ctx.fillStyle = '#4ecdc4';
    ctx.fillText('✨', 680, 80);
    
    ctx.fillStyle = '#96ceb4';
    ctx.fillText('✨', 750, 180);
    
    ctx.fillStyle = '#45b7d1';
    ctx.fillText('✨', 80, 350);
    ctx.globalAlpha = 1;

    // Ligne décorative en bas
    const bottomGradient = ctx.createLinearGradient(100, 350, 700, 350);
    bottomGradient.addColorStop(0, '#ff6b6b');
    bottomGradient.addColorStop(0.33, '#4ecdc4');
    bottomGradient.addColorStop(0.66, '#45b7d1');
    bottomGradient.addColorStop(1, '#96ceb4');
    
    ctx.strokeStyle = bottomGradient;
    ctx.lineWidth = 3;
    ctx.globalAlpha = 0.5;
    ctx.beginPath();
    ctx.moveTo(100, 350);
    ctx.lineTo(700, 350);
    ctx.stroke();
    ctx.globalAlpha = 1;

    // Convertir en buffer pour Telegram
    return canvas.toBuffer('image/png');

  } catch (error) {
    console.error('Error generating welcome image:', error);
    return null;
  }
}

module.exports = { generateWelcomeImage };