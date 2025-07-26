const { getBotInstance } = require('../lib/telegramBot');

module.exports = async (req, res) => {
  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    return res.status(200).json({});
  }
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  
  try {
    console.log('Webhook called with method:', req.method);
    console.log('Webhook body:', req.body);
    
    // Only allow POST requests
    if (req.method !== 'POST') {
      return res.status(405).json({
        success: false,
        error: 'Method not allowed',
        allowedMethods: ['POST']
      });
    }
    
    const bot = getBotInstance();
    const update = req.body;
    
    console.log('Processing webhook update:', JSON.stringify(update, null, 2));
    
    // Handle new chat members (when someone joins the channel)
    if (update.message && update.message.new_chat_members) {
      const newMembers = update.message.new_chat_members;
      const chatId = update.message.chat.id;
      
      for (const member of newMembers) {
        if (!member.is_bot) {
          await sendWelcomeMessage(bot, member);
        }
      }
    }
    
    // Handle my_chat_member updates (when bot status changes in channel)
    if (update.my_chat_member) {
      const newMember = update.my_chat_member.new_chat_member;
      const chat = update.my_chat_member.chat;
      
      if (chat.username === 'Atomic_flix_officiel' && newMember.status === 'member') {
        const user = update.my_chat_member.from;
        await sendWelcomeMessage(bot, user);
      }
    }
    
    // Handle text messages
    if (update.message && update.message.text) {
      const chatId = update.message.chat.id;
      const text = update.message.text;
      const userId = update.message.from.id;
      
      console.log(`Message from user ${userId}: ${text}`);
      console.log(`User details:`, update.message.from);
      
      // Handle commands
      if (text.startsWith('/start')) {
        await bot.sendMessage(chatId, 
          `🎬 Bienvenue sur ATOMIC FLIX !\n\n` +
          `Je suis votre assistant pour vérifier votre abonnement au canal @Atomic_flix_officiel.\n\n` +
          `Utilisez /verify pour vérifier votre abonnement.`,
          {
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: '✅ Vérifier mon abonnement',
                    callback_data: 'verify_subscription'
                  }
                ],
                [
                  {
                    text: '📱 Rejoindre le canal',
                    url: 'https://t.me/Atomic_flix_officiel'
                  }
                ]
              ]
            }
          }
        );
      } else if (text.match(/^\/message\s+(.+)/)) {
        // Commande pour envoyer message à toutes les apps
        const input = text.replace('/message ', '');
        const parts = input.split('"').filter(part => part.trim());
        
        // Vérifier si c'est l'admin (remplace par ton ID Telegram)
        const ADMIN_USER_ID = 6968736907; // ID admin principal
        if (userId !== ADMIN_USER_ID) {
          await bot.sendMessage(chatId, `❌ Accès refusé. Votre ID: ${userId}, Admin ID: ${ADMIN_USER_ID}`);
          return res.status(200).json({ success: true });
        }
        
        if (parts.length < 2) {
          await bot.sendMessage(chatId, '❌ Format: /message "Titre" "Message" [URL]');
          return res.status(200).json({ success: true });
        }
        
        const title = parts[0].trim();
        const message = parts[1].trim();
        const downloadUrl = parts[2] ? parts[2].trim() : null;
        
        try {
          // Appeler directement la fonction send-app-message au lieu de faire un appel HTTP
          const sendAppMessage = require('./send-app-message');
          
          const mockReq = {
            method: 'POST',
            body: {
              appId: 'atomic_flix_mobile_v1',
              message: {
                title,
                message,
                downloadUrl,
                buttonText: downloadUrl ? '📥 Télécharger' : 'OK'
              }
            }
          };
          
          const mockRes = {
            setHeader: () => {},
            status: (code) => ({
              json: (data) => data
            })
          };
          
          await sendAppMessage(mockReq, mockRes);
          
          await bot.sendMessage(chatId, `✅ Message envoyé à toutes les apps ATOMIC FLIX\n\n📝 Titre: ${title}\n💬 Message: ${message}${downloadUrl ? `\n🔗 Lien: ${downloadUrl}` : ''}`);
          
        } catch (error) {
          console.error('Erreur envoi message:', error);
          await bot.sendMessage(chatId, '❌ Erreur lors de l\'envoi du message');
        }
      } else if (text.startsWith('/verify')) {
        // Check subscription status
        const { verifySubscription } = require('../lib/telegramBot');
        const result = await verifySubscription(userId.toString());
        
        if (result.isSubscribed) {
          await bot.sendMessage(chatId, 
            `✅ Parfait ! Vous êtes bien abonné au canal @Atomic_flix_officiel.\n\n` +
            `Vous pouvez maintenant profiter de tous les contenus ATOMIC FLIX !`,
            {
              reply_markup: {
                inline_keyboard: [
                  [
                    {
                      text: '🎬 Accéder au canal',
                      url: 'https://t.me/Atomic_flix_officiel'
                    }
                  ]
                ]
              }
            }
          );
        } else {
          await bot.sendMessage(chatId, 
            `❌ Vous n'êtes pas encore abonné au canal @Atomic_flix_officiel.\n\n` +
            `Veuillez vous abonner d'abord, puis utilisez /verify pour vérifier votre abonnement.`,
            {
              reply_markup: {
                inline_keyboard: [
                  [
                    {
                      text: '📱 Rejoindre le canal',
                      url: 'https://t.me/Atomic_flix_officiel'
                    }
                  ],
                  [
                    {
                      text: '🔄 Vérifier après abonnement',
                      callback_data: 'verify_subscription'
                    }
                  ]
                ]
              }
            }
          );
        }
      } else if (text.startsWith('/help')) {
        await bot.sendMessage(chatId, 
          `🤖 *ATOMIC FLIX Bot*\n\n` +
          `Commandes disponibles:\n\n` +
          `/message "Titre" "Message" [URL]\n` +
          `   Envoie un message à toutes les apps\n\n` +
          `Exemple:\n` +
          `/message "Nouvelle version" "Version 2.9.1 disponible !" https://apkpure.com/atomic-flix\n\n` +
          `/help - Affiche cette aide`,
          { parse_mode: 'Markdown' }
        );

      } else if (text.startsWith('/movies')) {
        await bot.sendMessage(chatId, 
          `🍿 Cette commande n'est plus disponible.\n\n` +
          `ATOMIC FLIX se concentre maintenant exclusivement sur les animes !\n\n` +
          `Utilisez /anime pour découvrir notre catalogue complet d'animes.`,
          {
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: '🍿 Voir les animes',
                    callback_data: 'welcome_anime'
                  }
                ]
              ]
            }
          }
        );





      } else {
        // Default response for other messages
        await bot.sendMessage(chatId, 
          `🤖 Salut ! Je suis le bot ATOMIC FLIX.\n\n` +
          `Utilisez /start pour commencer ou /verify pour vérifier votre abonnement.`,
          {
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: '🎬 Démarrer',
                    callback_data: 'start'
                  },
                  {
                    text: '✅ Vérifier',
                    callback_data: 'verify_subscription'
                  }
                ]
              ]
            }
          }
        );
      }
    }
    
    // Handle callback queries (inline button presses)
    if (update.callback_query) {
      const callbackData = update.callback_query.data;
      const chatId = update.callback_query.message.chat.id;
      const userId = update.callback_query.from.id;
      
      console.log(`Callback query from user ${userId}: ${callbackData}`);
      
      if (callbackData === 'verify_subscription') {
        const { verifySubscription } = require('../lib/telegramBot');
        const result = await verifySubscription(userId.toString());
        
        if (result.isSubscribed) {
          await bot.editMessageText(
            `✅ Parfait ! Vous êtes bien abonné au canal @Atomic_flix_officiel.\n\n` +
            `Vous pouvez maintenant profiter de tous les contenus ATOMIC FLIX !`,
            {
              chat_id: chatId,
              message_id: update.callback_query.message.message_id,
              reply_markup: {
                inline_keyboard: [
                  [
                    {
                      text: '🎬 Accéder au canal',
                      url: 'https://t.me/Atomic_flix_officiel'
                    }
                  ]
                ]
              }
            }
          );
        } else {
          await bot.editMessageText(
            `❌ Vous n'êtes pas encore abonné au canal @Atomic_flix_officiel.\n\n` +
            `Veuillez vous abonner d'abord, puis cliquez sur "Vérifier après abonnement".`,
            {
              chat_id: chatId,
              message_id: update.callback_query.message.message_id,
              reply_markup: {
                inline_keyboard: [
                  [
                    {
                      text: '📱 Rejoindre le canal',
                      url: 'https://t.me/Atomic_flix_officiel'
                    }
                  ],
                  [
                    {
                      text: '🔄 Vérifier après abonnement',
                      callback_data: 'verify_subscription'
                    }
                  ]
                ]
              }
            }
          );
        }
      } else if (callbackData === 'welcome_anime') {
        await bot.editMessageText(
          `🍿 Bienvenue dans l'univers Anime ATOMIC FLIX !\n\n` +
          `📺 **Nos animes populaires :**\n` +
          `• Attack on Titan - Saison finale\n` +
          `• Demon Slayer - Épisodes récents\n` +
          `• One Piece - Mise à jour quotidienne\n` +
          `• Jujutsu Kaisen - Nouvelle saison\n` +
          `• Naruto/Boruto - Collection complète\n\n` +
          `🎌 **Genres disponibles :**\n` +
          `• Shonen • Seinen • Josei • Kodomomuke\n` +
          `• Romance • Action • Fantastique • Horreur\n\n` +
          `Utilisez /anime pour plus de détails !`,
          {
            chat_id: chatId,
            message_id: update.callback_query.message.message_id,
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: '🎬 Accéder aux animes',
                    url: 'https://t.me/Atomic_flix_officiel'
                  }
                ]
              ]
            }
          }
        );
      } else if (callbackData === 'welcome_movies') {
        await bot.editMessageText(
          `🍿 ATOMIC FLIX se concentre maintenant exclusivement sur les animes !\n\n` +
          `🎌 **Notre catalogue anime premium :**\n` +
          `• Animes populaires mis à jour quotidiennement\n` +
          `• Tous les genres : Shonen, Seinen, Josei\n` +
          `• Qualité HD avec sous-titres français\n` +
          `• Épisodes disponibles dès leur sortie\n\n` +
          `Rejoignez notre communauté otaku !`,
          {
            chat_id: chatId,
            message_id: update.callback_query.message.message_id,
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: '🍿 Voir les animes',
                    url: 'https://t.me/Atomic_flix_officiel'
                  }
                ]
              ]
            }
          }
        );
      } else if (callbackData === 'start') {
        await bot.editMessageText(
          `🎬 Bienvenue sur ATOMIC FLIX !\n\n` +
          `Je suis votre assistant pour vérifier votre abonnement au canal @Atomic_flix_officiel.\n\n` +
          `Utilisez le bouton ci-dessous pour vérifier votre abonnement.`,
          {
            chat_id: chatId,
            message_id: update.callback_query.message.message_id,
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: '✅ Vérifier mon abonnement',
                    callback_data: 'verify_subscription'
                  }
                ],
                [
                  {
                    text: '📱 Rejoindre le canal',
                    url: 'https://t.me/Atomic_flix_officiel'
                  }
                ]
              ]
            }
          }
        );
      }
      
      // Answer callback query to stop loading indicator
      await bot.answerCallbackQuery(update.callback_query.id);
    }
    
    // Return success response
    return res.status(200).json({
      success: true,
      message: 'Webhook processed successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Webhook error:', error);
    
    return res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

// Fonction pour envoyer un message de bienvenue PUBLIC aux nouveaux membres
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
    
    // PUBLIER LE MESSAGE AVEC IMAGE PERSONNALISÉE DANS LE CANAL PUBLIC
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
    
    console.log(`PUBLIC welcome message posted successfully in channel for ${username}`);
    
  } catch (error) {
    console.error('Error sending PUBLIC welcome message:', error);
    
    // Log détaillé de l'erreur
    if (error.code === 403) {
      console.log(`Bot does not have permission to send messages to channel`);
    } else if (error.code === 400) {
      console.log(`Bad request - channel may not exist or bot not added`);
    } else {
      console.log(`Error details:`, error);
    }
  }
}