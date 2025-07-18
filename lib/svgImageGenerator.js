const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { getAtomicFlixLogoBase64 } = require('./logoConverter');

/**
 * Génère une image SVG d'accueil personnalisée avec informations utilisateur
 */
async function generateWelcomeSVG(user, bot) {
  try {
    const username = user.username ? `@${user.username}` : user.first_name || 'Nouveau membre';
    const firstName = user.first_name || 'Nouvel ami';
    
    console.log(`Generating SVG welcome image for ${username}...`);
    
    // Récupérer l'URL de la photo de profil si disponible
    let profileImageUrl = null;
    try {
      const userPhotos = await bot.getUserProfilePhotos(user.id, { limit: 1 });
      if (userPhotos.photos && userPhotos.photos.length > 0) {
        const photo = userPhotos.photos[0][0];
        const fileInfo = await bot.getFile(photo.file_id);
        profileImageUrl = `https://api.telegram.org/file/bot${bot.token}/${fileInfo.file_path}`;
      }
    } catch (error) {
      console.log('Could not get profile image, using default avatar');
    }
    
    // Charger le logo ATOMIC FLIX
    const atomicFlixLogo = getAtomicFlixLogoBase64();
    
    // Template SVG avec photo de profil intégrée
    const svgTemplate = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="800" height="400" viewBox="0 0 800 400" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <!-- Background gradient -->
    <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1a1a2e;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#16213e;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#0f3460;stop-opacity:1" />
    </linearGradient>
    
    <!-- Anime style gradient -->
    <linearGradient id="animeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#ff6b6b;stop-opacity:1" />
      <stop offset="33%" style="stop-color:#4ecdc4;stop-opacity:1" />
      <stop offset="66%" style="stop-color:#45b7d1;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#96ceb4;stop-opacity:1" />
    </linearGradient>
    
    <!-- Text shadow filter -->
    <filter id="textShadow">
      <feDropShadow dx="2" dy="2" stdDeviation="3" flood-color="#000000" flood-opacity="0.5"/>
    </filter>
    
    <!-- Glow effect -->
    <filter id="glow">
      <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
      <feMerge> 
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
    
    <!-- Clip path for profile image -->
    <clipPath id="circleClip">
      <circle cx="200" cy="160" r="35"/>
    </clipPath>
  </defs>
  
  <!-- Background -->
  <rect width="800" height="400" fill="url(#bgGradient)"/>
  
  <!-- Decorative circles -->
  <circle cx="100" cy="80" r="40" fill="#ff6b6b" opacity="0.1"/>
  <circle cx="700" cy="320" r="60" fill="#4ecdc4" opacity="0.1"/>
  <circle cx="650" cy="100" r="30" fill="#96ceb4" opacity="0.1"/>
  <circle cx="150" cy="300" r="50" fill="#45b7d1" opacity="0.1"/>
  
  <!-- Anime-style geometric shapes -->
  <polygon points="50,200 100,150 150,200 100,250" fill="#ff6b6b" opacity="0.2"/>
  <polygon points="650,50 700,25 750,50 700,75" fill="#4ecdc4" opacity="0.2"/>
  
  <!-- Main content area -->
  <rect x="150" y="100" width="500" height="200" rx="20" fill="rgba(255,255,255,0.1)" stroke="url(#animeGradient)" stroke-width="2"/>
  
  <!-- ATOMIC FLIX Logo rond avec effet néon (côté gauche) -->
  <defs>
    <clipPath id="logoClip">
      <circle cx="200" cy="160" r="40"/>
    </clipPath>
    <radialGradient id="neonGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" style="stop-color:#ff6b6b;stop-opacity:0.8" />
      <stop offset="30%" style="stop-color:#4ecdc4;stop-opacity:0.6" />
      <stop offset="70%" style="stop-color:#45b7d1;stop-opacity:0.4" />
      <stop offset="100%" style="stop-color:#0f3460;stop-opacity:0.2" />
    </radialGradient>
    <filter id="logoGlow">
      <feGaussianBlur stdDeviation="6" result="coloredBlur"/>
      <feMerge> 
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  
  <!-- Fond circulaire avec glow pour le logo -->
  <circle cx="200" cy="160" r="45" fill="url(#neonGlow)" filter="url(#logoGlow)" opacity="0.8"/>
  <circle cx="200" cy="160" r="42" fill="none" stroke="url(#animeGradient)" stroke-width="3"/>
  
  <!-- Logo ATOMIC FLIX réel dans le cercle -->
  <image href="${atomicFlixLogo || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iNTAiIGN5PSI1MCIgcj0iNDAiIGZpbGw9IiNmZjZiNmIiLz48L3N2Zz4='}" 
         x="158" y="118" width="84" height="84" 
         clip-path="url(#logoClip)" 
         filter="url(#logoGlow)"/>
  
  ${profileImageUrl ? `
  <!-- User profile image (côté droit) -->
  <circle cx="260" cy="140" r="28" fill="rgba(255,255,255,0.1)" stroke="#4ecdc4" stroke-width="3"/>
  <image href="${profileImageUrl}" x="232" y="112" width="56" height="56" clip-path="url(#profileClipSmall)" />
  <defs>
    <clipPath id="profileClipSmall">
      <circle cx="260" cy="140" r="26"/>
    </clipPath>
  </defs>
  ` : `
  <!-- Default user avatar -->
  <circle cx="260" cy="140" r="28" fill="#4ecdc4" opacity="0.8" stroke="#ffffff" stroke-width="3"/>
  <text x="260" y="150" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" fill="#ffffff">👤</text>
  `}
  
  <!-- ATOMIC FLIX logo text -->
  <text x="400" y="140" text-anchor="middle" font-family="Arial Black, sans-serif" font-size="36" font-weight="bold" fill="url(#animeGradient)" filter="url(#textShadow)">
    ATOMIC FLIX
  </text>
  
  <!-- Subtitle -->
  <text x="400" y="165" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" fill="#ffffff" opacity="0.9">
    Communauté Anime Francophone
  </text>
  
  <!-- Welcome message with username -->
  <text x="400" y="190" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="#4ecdc4" filter="url(#glow)">
    🎉 BIENVENUE ${firstName} ! 🎉
  </text>
  
  <!-- Username display -->
  <text x="400" y="210" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" fill="#96ceb4">
    ${username}
  </text>
  
  <!-- Features icons and text -->
  <g transform="translate(220, 250)">
    <!-- Anime icon -->
    <circle cx="0" cy="0" r="18" fill="#ff6b6b" opacity="0.8"/>
    <text x="0" y="6" text-anchor="middle" font-family="Arial, sans-serif" font-size="16">🎌</text>
    <text x="0" y="30" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" fill="#ffffff">1000+ Animes</text>
  </g>
  
  <g transform="translate(320, 250)">
    <!-- HD Quality icon -->
    <circle cx="0" cy="0" r="18" fill="#4ecdc4" opacity="0.8"/>
    <text x="0" y="6" text-anchor="middle" font-family="Arial, sans-serif" font-size="16">📺</text>
    <text x="0" y="30" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" fill="#ffffff">Qualité HD</text>
  </g>
  
  <g transform="translate(420, 250)">
    <!-- Updates icon -->
    <circle cx="0" cy="0" r="18" fill="#45b7d1" opacity="0.8"/>
    <text x="0" y="6" text-anchor="middle" font-family="Arial, sans-serif" font-size="16">🔄</text>
    <text x="0" y="30" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" fill="#ffffff">Quotidien</text>
  </g>
  
  <g transform="translate(520, 250)">
    <!-- Community icon -->
    <circle cx="0" cy="0" r="18" fill="#96ceb4" opacity="0.8"/>
    <text x="0" y="6" text-anchor="middle" font-family="Arial, sans-serif" font-size="16">💬</text>
    <text x="0" y="30" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" fill="#ffffff">Communauté</text>
  </g>
  
  <!-- Decorative anime-style stars -->
  <text x="120" y="60" font-family="Arial, sans-serif" font-size="20" fill="#ff6b6b" opacity="0.6">✨</text>
  <text x="680" y="80" font-family="Arial, sans-serif" font-size="18" fill="#4ecdc4" opacity="0.6">✨</text>
  <text x="750" y="180" font-family="Arial, sans-serif" font-size="16" fill="#96ceb4" opacity="0.6">✨</text>
  <text x="80" y="350" font-family="Arial, sans-serif" font-size="20" fill="#45b7d1" opacity="0.6">✨</text>
  
  <!-- Bottom decorative line -->
  <line x1="100" y1="350" x2="700" y2="350" stroke="url(#animeGradient)" stroke-width="3" opacity="0.5"/>
  
  <!-- Anime-style kawaii faces -->
  <text x="50" y="150" font-family="Arial, sans-serif" font-size="14" fill="#ff6b6b" opacity="0.4">( ◕ ω ◕ )</text>
  <text x="700" y="250" font-family="Arial, sans-serif" font-size="14" fill="#4ecdc4" opacity="0.4">(๑˃ᴗ˂)ﻭ</text>
  
  <!-- Date stamp -->
  <text x="400" y="380" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="#ffffff" opacity="0.5">
    Rejoint le ${new Date().toLocaleDateString('fr-FR')}
  </text>
</svg>`;

    return svgTemplate;

  } catch (error) {
    console.error('Error generating welcome SVG:', error);
    return null;
  }
}

module.exports = { generateWelcomeSVG };