const { getBotInstance } = require('../lib/telegramBot');

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).json({});
  }
  
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({
        success: false,
        error: 'Method not allowed'
      });
    }
    
    const bot = getBotInstance();
    const update = req.body;
    
    console.log('Channel event received:', JSON.stringify(update, null, 2));
    
    // Détecter les nouveaux membres dans le canal
    if (update.channel_post && update.channel_post.new_chat_members) {
      const newMembers = update.channel_post.new_chat_members;
      const channelId = update.channel_post.chat.id;
      
      for (const member of newMembers) {
        if (!member.is_bot) {
          // Envoyer un message de bienvenue privé au nouveau membre
          await sendWelcomeMessage(bot, member);
        }
      }
    }
    
    // Détecter les nouveaux membres via my_chat_member
    if (update.my_chat_member && update.my_chat_member.new_chat_member) {
      const newMember = update.my_chat_member.new_chat_member;
      const chat = update.my_chat_member.chat;
      
      if (chat.username === 'Atomic_flix_officiel' && newMember.status === 'member') {
        const user = update.my_chat_member.from;
        await sendWelcomeMessage(bot, user);
      }
    }
    
    return res.status(200).json({
      success: true,
      message: 'Channel event processed',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Channel event error:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

async function sendWelcomeMessage(bot, user) {
  try {
    const userId = user.id;
    const firstName = user.first_name || 'Nouveau membre';
    const username = user.username ? `@${user.username}` : firstName;
    
    console.log(`Sending welcome message to new member: ${username} (${userId})`);
    
    // Message de bienvenue personnalisé
    const welcomeMessage = 
      `🎉 Bienvenue sur ATOMIC FLIX, ${firstName} !\n\n` +
      `🎬 Félicitations ! Vous venez de rejoindre la plus grande communauté de streaming francophone.\n\n` +
      `✨ **Votre accès premium inclut :**\n` +
      `• 🍿 Animes en exclusivité\n` +
      `• 🎭 Films et séries récents\n` +
      `• 📺 Contenus 4K sans publicité\n` +
      `• 💬 Communauté active de +1000 membres\n\n` +
      `🚀 **Pour commencer :**\n` +
      `• Explorez notre catalogue avec /anime\n` +
      `• Découvrez les nouveautés avec /movies\n` +
      `• Vérifiez votre statut avec /status\n\n` +
      `🎁 **Bonus de bienvenue :**\n` +
      `Accès immédiat à tous nos contenus premium !\n\n` +
      `Merci de nous faire confiance ! 🙏`;
    
    await bot.sendMessage(userId, welcomeMessage, {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: '🍿 Découvrir les animes',
              callback_data: 'welcome_anime'
            },
            {
              text: '🎭 Voir les films',
              callback_data: 'welcome_movies'
            }
          ],
          [
            {
              text: '📊 Mon statut premium',
              callback_data: 'verify_subscription'
            }
          ],
          [
            {
              text: '🎬 Retour au canal',
              url: 'https://t.me/Atomic_flix_officiel'
            }
          ]
        ]
      }
    });
    
    console.log(`Welcome message sent successfully to ${username}`);
    
  } catch (error) {
    console.error('Error sending welcome message:', error);
    
    // Si l'envoi privé échoue, ne pas faire d'erreur
    if (error.code === 403) {
      console.log(`User ${user.id} has blocked private messages`);
    }
  }
}