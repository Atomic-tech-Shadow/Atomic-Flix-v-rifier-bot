// Fonctionnalités pour encourager l'abonnement au canal
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
      case 'send_welcome_incentive':
        await sendWelcomeIncentive(bot, userId);
        break;
      
      case 'send_content_teaser':
        await sendContentTeaser(bot, userId);
        break;
        
      case 'send_subscriber_count':
        await sendSubscriberCount(bot, userId);
        break;
        
      case 'send_limited_offer':
        await sendLimitedOffer(bot, userId);
        break;
        
      default:
        return res.status(400).json({ error: 'Invalid action' });
    }

    res.json({ 
      success: true, 
      message: `${action} executed successfully` 
    });

  } catch (error) {
    console.error('Growth feature error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
}

// Message d'accueil avec incitation
async function sendWelcomeIncentive(bot, userId) {
  const message = `🎬 Bienvenue sur ATOMIC FLIX !

🔥 CONTENU EXCLUSIF sur notre canal :
▶️ Films en première mondiale
▶️ Séries avant tout le monde  
▶️ Contenu VIP réservé aux abonnés
▶️ Pas de publicité

🎁 BONUS SPÉCIAL : Abonnez-vous maintenant et recevez :
• 3 films premium GRATUITS
• Accès anticipé aux nouveautés
• Notifications des sorties

👥 Rejoignez des milliers de fans qui profitent déjà !`;

  const keyboard = {
    inline_keyboard: [
      [
        { text: '🎬 Rejoindre le canal', url: 'https://t.me/Atomic_flix_officiel' }
      ],
      [
        { text: '✅ J\'ai rejoint', callback_data: 'joined_channel' }
      ],
      [
        { text: '❓ Pourquoi rejoindre ?', callback_data: 'why_join' }
      ]
    ]
  };

  await bot.sendMessage(userId, message, { reply_markup: keyboard });
}

// Teaser de contenu pour inciter
async function sendContentTeaser(bot, userId) {
  const teasers = [
    {
      title: "🎬 NOUVEAU : Action Hero 2025",
      description: "Bande-annonce exclusive disponible uniquement sur le canal !",
      rating: "⭐ 9.2/10"
    },
    {
      title: "📺 SÉRIE : Mystery Island S02",
      description: "Épisode 1 disponible en avant-première !",
      rating: "🔥 Trending #1"
    },
    {
      title: "🎭 DOCUMENTAIRE : Behind the Scenes",
      description: "Coulisses exclusives de vos films préférés",
      rating: "👥 +50K vues"
    }
  ];

  const randomTeaser = teasers[Math.floor(Math.random() * teasers.length)];
  
  const message = `${randomTeaser.title}

${randomTeaser.description}
${randomTeaser.rating}

💡 Contenu complet disponible sur le canal !
🎯 Abonnez-vous pour ne rien manquer`;

  const keyboard = {
    inline_keyboard: [
      [
        { text: '🚀 Voir le contenu complet', url: 'https://t.me/Atomic_flix_officiel' }
      ],
      [
        { text: '🔔 Recevoir les notifications', callback_data: 'enable_notifications' }
      ]
    ]
  };

  await bot.sendMessage(userId, message, { reply_markup: keyboard });
}

// Afficher le nombre d'abonnés pour créer du social proof
async function sendSubscriberCount(bot, userId) {
  try {
    const chatInfo = await bot.getChat('@Atomic_flix_officiel');
    const memberCount = chatInfo.members_count || 'des milliers de';
    
    const message = `👥 ${memberCount} personnes profitent déjà d'ATOMIC FLIX !

🔥 Rejoignez la communauté qui grandit chaque jour :
• +127 nouveaux membres cette semaine
• +540 ce mois-ci
• Communauté active et engagée

⭐ Témoignages récents :
"Meilleure app de streaming !" - Sarah M.
"Content exclusif incroyable" - Ahmed K.
"Je recommande à 100%" - Marie L.

🎯 Ne restez pas à l'écart !`;

    const keyboard = {
      inline_keyboard: [
        [
          { text: '👥 Rejoindre la communauté', url: 'https://t.me/Atomic_flix_officiel' }
        ],
        [
          { text: '📊 Voir les statistiques', callback_data: 'show_stats' }
        ]
      ]
    };

    await bot.sendMessage(userId, message, { reply_markup: keyboard });
  } catch (error) {
    // Fallback si on ne peut pas récupérer les stats
    const message = `👥 Des milliers de fans profitent déjà d'ATOMIC FLIX !

🔥 Rejoignez notre communauté grandissante !`;
    
    const keyboard = {
      inline_keyboard: [
        [
          { text: '👥 Rejoindre maintenant', url: 'https://t.me/Atomic_flix_officiel' }
        ]
      ]
    };

    await bot.sendMessage(userId, message, { reply_markup: keyboard });
  }
}

// Offre limitée pour créer l'urgence
async function sendLimitedOffer(bot, userId) {
  const message = `⏰ OFFRE LIMITÉE - 24H SEULEMENT !

🎁 Abonnez-vous maintenant et recevez :
• 5 films premium GRATUITS (au lieu de 3)
• 1 mois d'accès VIP sans publicité
• Accès aux contenus avant-première
• Badge membre fondateur

🔥 Seulement pour les 100 premiers !
⏰ Offre expire dans : 23h 45min

💡 Plus de 2500 personnes ont déjà profité de cette offre`;

  const keyboard = {
    inline_keyboard: [
      [
        { text: '🎁 Profiter de l\'offre', url: 'https://t.me/Atomic_flix_officiel' }
      ],
      [
        { text: '⏰ Rappel dans 1h', callback_data: 'remind_offer' }
      ],
      [
        { text: '❌ Pas intéressé', callback_data: 'not_interested' }
      ]
    ]
  };

  await bot.sendMessage(userId, message, { reply_markup: keyboard });
}