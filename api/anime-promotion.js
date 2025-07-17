// Fonctionnalités spéciales pour promouvoir ATOMIC FLIX anime platform
const TelegramBot = require('node-telegram-bot-api');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { action, userId, data } = req.body;

  try {
    const BOT_TOKEN = '8136643576:AAEIwUDrBN_0LOn2eqQZdzhZZuFzaGgfNwg';
    const bot = new TelegramBot(BOT_TOKEN, { polling: false });

    switch (action) {
      case 'send_anime_welcome':
        await sendAnimeWelcome(bot, userId);
        break;
      
      case 'send_anime_features':
        await sendAnimeFeatures(bot, userId);
        break;
        
      case 'send_latest_anime':
        await sendLatestAnime(bot, userId);
        break;
        
      case 'send_platform_demo':
        await sendPlatformDemo(bot, userId);
        break;
        
      case 'send_otaku_exclusive':
        await sendOtakuExclusive(bot, userId);
        break;
        
      default:
        return res.status(400).json({ error: 'Invalid action' });
    }

    res.json({ 
      success: true, 
      message: `${action} executed successfully` 
    });

  } catch (error) {
    console.error('Anime promotion error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
}

// Message d'accueil pour les fans d'anime
async function sendAnimeWelcome(bot, userId) {
  const message = `🎬✨ ATOMIC FLIX - LA PLATEFORME ULTIME POUR LES OTAKUS ! ✨🎬

🔥 ENFIN une plateforme qui comprend VRAIMENT les fans d'anime !

⚡ Ce qui vous attend :
• 🎯 Interface ultra-moderne avec thème sombre
• 🎮 Lecteur vidéo premium intégré
• 📱 Application mobile disponible 
• 🔍 Recherche instantanée d'animes
• 📚 Lecteur de manga intégré
• 🌙 Design glassmorphism qui fait rêver

🚀 Plus qu'un simple site - c'est UNE EXPÉRIENCE !

Fini les pubs intrusives, fini les sites moches des années 2000 !
ATOMIC FLIX c'est du Netflix-level mais pour les animes ! 🎌`;

  const keyboard = {
    inline_keyboard: [
      [
        { text: '🚀 Tester maintenant', url: 'https://atomic-flix.vercel.app' }
      ],
      [
        { text: '📱 Télécharger APK', callback_data: 'download_apk' }
      ],
      [
        { text: '🎌 Voir les animes populaires', callback_data: 'popular_anime' }
      ],
      [
        { text: '📚 Découvrir les mangas', callback_data: 'manga_section' }
      ]
    ]
  };

  await bot.sendMessage(userId, message, { reply_markup: keyboard });
}

// Présentation des fonctionnalités techniques
async function sendAnimeFeatures(bot, userId) {
  const message = `🎯 ATOMIC FLIX - FONCTIONNALITÉS TECHNIQUES

🔥 Interface révolutionnaire :
• 🌙 Thème sombre optimisé pour les yeux
• 🎨 Design glassmorphism moderne
• ⚡ Performances ultra-rapides
• 📱 100% responsive (mobile & desktop)

🎮 Lecteur vidéo premium :
• 🎬 Qualité HD/4K
• ⏯️ Contrôles intuitifs
• 🔄 Lecture automatique
• 💾 Sauvegarde de progression

🔍 Recherche avancée :
• 🎯 Recherche instantanée
• 🏷️ Filtres par genre
• ⭐ Classement par note
• 📅 Tri par année

📚 Manga intégré :
• 📖 Lecteur fluide
• 🌙 Mode nuit
• 📱 Optimisé mobile
• 🔖 Marque-pages automatiques`;

  const keyboard = {
    inline_keyboard: [
      [
        { text: '🎬 Voir une démo', callback_data: 'show_demo' }
      ],
      [
        { text: '📱 Interface mobile', callback_data: 'mobile_demo' }
      ],
      [
        { text: '🚀 Commencer maintenant', url: 'https://atomic-flix.vercel.app' }
      ]
    ]
  };

  await bot.sendMessage(userId, message, { reply_markup: keyboard });
}

// Derniers animes ajoutés
async function sendLatestAnime(bot, userId) {
  const animeList = [
    "🔥 Attack on Titan S4 - Final Season",
    "⚡ Demon Slayer - Hashira Training Arc",
    "🎌 Jujutsu Kaisen S2",
    "🌙 Chainsaw Man",
    "⚔️ Bleach - Thousand Year Blood War",
    "🎯 Spy x Family S2",
    "🔮 Frieren - Beyond Journey's End",
    "🌊 One Piece - Egghead Island"
  ];

  const message = `🎬 DERNIERS ANIMES AJOUTÉS SUR ATOMIC FLIX

${animeList.map(anime => `• ${anime}`).join('\n')}

🔥 Et bien plus encore ! Plus de 5000 animes disponibles !

⚡ Nouveautés ajoutées chaque semaine
🎯 Sous-titres français disponibles
🌙 Qualité HD garantie
📱 Synchronisation multi-appareils

🎌 Votre prochaine série préférée vous attend !`;

  const keyboard = {
    inline_keyboard: [
      [
        { text: '🎬 Voir tous les animes', url: 'https://atomic-flix.vercel.app' }
      ],
      [
        { text: '🔥 Animes populaires', callback_data: 'trending_anime' }
      ],
      [
        { text: '🎯 Mes recommandations', callback_data: 'recommendations' }
      ]
    ]
  };

  await bot.sendMessage(userId, message, { reply_markup: keyboard });
}

// Démonstration de la plateforme
async function sendPlatformDemo(bot, userId) {
  const message = `🎬 ATOMIC FLIX - DÉMONSTRATION LIVE

🔥 Découvrez pourquoi 50,000+ otakus ont choisi ATOMIC FLIX :

📱 INTERFACE MOBILE :
• Navigation intuitive
• Recherche vocale
• Mode hors-ligne
• Notifications personnalisées

💻 VERSION DESKTOP :
• Lecteur plein écran
• Raccourcis clavier
• Multi-onglets
• Qualité 4K

🎯 FONCTIONNALITÉS UNIQUES :
• 🎌 Recommandations IA
• 🔥 Watchlist personnalisée
• 📊 Statistiques de visionnage
• 👥 Communauté intégrée

⚡ PERFORMANCES :
• Chargement instantané
• Zéro pub intrusive
• Streaming fluide
• Synchronisation cloud`;

  const keyboard = {
    inline_keyboard: [
      [
        { text: '🚀 Tester maintenant', url: 'https://atomic-flix.vercel.app' }
      ],
      [
        { text: '📱 Télécharger APK', callback_data: 'download_apk' }
      ],
      [
        { text: '🎥 Voir la démo vidéo', callback_data: 'video_demo' }
      ]
    ]
  };

  await bot.sendMessage(userId, message, { reply_markup: keyboard });
}

// Contenu exclusif pour otakus
async function sendOtakuExclusive(bot, userId) {
  const message = `🎌 ATOMIC FLIX - EXCLUSIF OTAKUS

🔥 Contenu que vous ne trouverez nulle part ailleurs :

🎬 ANIMES EXCLUSIFS :
• Premières mondiales
• Versions director's cut
• Épisodes spéciaux
• OVAs rares

📚 MANGAS PREMIUM :
• Chapitres avant-première
• Versions colorisées
• Éditions collector
• Bonus artbook

🎯 COMMUNAUTÉ OTAKU :
• Chat en temps réel
• Reviews communautaires
• Classements personnels
• Événements spéciaux

💎 AVANTAGES ABONNÉS :
• Accès anticipé
• Qualité 4K
• Téléchargement illimité
• Support prioritaire

🎁 BONUS SPÉCIAL :
Rejoignez maintenant et recevez 1 mois premium GRATUIT !`;

  const keyboard = {
    inline_keyboard: [
      [
        { text: '🎁 Réclamer mon bonus', url: 'https://atomic-flix.vercel.app' }
      ],
      [
        { text: '🎌 Rejoindre la communauté', url: 'https://t.me/Atomic_flix_officiel' }
      ],
      [
        { text: '🔥 Voir le contenu exclusif', callback_data: 'exclusive_content' }
      ]
    ]
  };

  await bot.sendMessage(userId, message, { reply_markup: keyboard });
}