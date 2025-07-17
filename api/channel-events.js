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
    
    console.log(`Sending PUBLIC welcome message for new member: ${username} (${userId})`);
    
    // Message de bienvenue PUBLIC dans le canal
    const welcomeMessage = 
      `🎉 ATOMIC FLIX vous souhaite la bienvenue ${username} !\n\n` +
      `🍿 Merci de rejoindre notre communauté anime et d'utiliser nos services premium.\n\n` +
      `✨ Votre accès inclut :\n` +
      `• 🎌 1000+ animes exclusifs\n` +
      `• 📺 Qualité HD + sous-titres français\n` +
      `• 🔄 Nouveautés quotidiennes\n` +
      `• 💬 Communauté otaku passionnée\n\n` +
      `Bonne découverte ! 🙏✨`;
    
    // ENVOYER LE MESSAGE AVEC IMAGE PERSONNALISÉE DANS LE CANAL PUBLIC
    const channelId = '@Atomic_flix_officiel';
    const { generateWelcomeSVG } = require('../lib/svgImageGenerator');
    
    try {
      // Générer l'image SVG personnalisée avec la photo de profil de l'utilisateur
      console.log(`Generating personalized welcome SVG for ${username}...`);
      const svgContent = await generateWelcomeSVG(user, bot);
      
      if (svgContent) {
        // Sauvegarder temporairement le SVG
        const fs = require('fs');
        const tempSvgPath = `temp-welcome-${user.id}.svg`;
        fs.writeFileSync(tempSvgPath, svgContent);
        
        // Envoyer l'image personnalisée avec le message
        await bot.sendDocument(channelId, tempSvgPath, {
          caption: welcomeMessage,
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: '🍿 Explorer le catalogue',
                  callback_data: 'welcome_anime'
                },
                {
                  text: '🤖 Parler au bot',
                  url: 'https://t.me/Atomic_flix_verifier_bot'
                }
              ]
            ]
          }
        });
        
        // Nettoyer le fichier temporaire
        fs.unlinkSync(tempSvgPath);
        console.log(`Personalized welcome SVG sent successfully for ${username}`);
      } else {
        // Fallback : envoyer seulement le message texte si la génération d'image échoue
        await bot.sendMessage(channelId, welcomeMessage, {
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: '🍿 Explorer le catalogue',
                  callback_data: 'welcome_anime'
                },
                {
                  text: '🤖 Parler au bot',
                  url: 'https://t.me/Atomic_flix_verifier_bot'
                }
              ]
            ]
          }
        });
        console.log(`Fallback: Text-only welcome message sent for ${username}`);
      }
    } catch (imageError) {
      console.log('Error with personalized image, sending text only:', imageError.message);
      // Fallback : envoyer seulement le message texte
      await bot.sendMessage(channelId, welcomeMessage, {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: '🍿 Explorer le catalogue',
                callback_data: 'welcome_anime'
              },
              {
                text: '🤖 Parler au bot',
                url: 'https://t.me/Atomic_flix_verifier_bot'
              }
            ]
          ]
        }
      });
    }
    
    console.log(`PUBLIC welcome message sent successfully to channel for ${username}`);
    
  } catch (error) {
    console.error('Error sending PUBLIC welcome message:', error);
    
    // Log détaillé de l'erreur
    if (error.code === 403) {
      console.log(`Bot does not have permission to send messages to channel`);
    } else if (error.code === 400) {
      console.log(`Bad request - channel may not exist or bot not added`);
    } else {
      console.log(`Error code: ${error.code}, message: ${error.message}`);
    }
  }
}