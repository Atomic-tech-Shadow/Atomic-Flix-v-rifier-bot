# Créer la Commande /update dans votre Bot Telegram

## Code à ajouter dans votre bot
```javascript
// Commande /update pour envoyer notification push à tous les utilisateurs
bot.onText(/\/update (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const downloadUrl = match[1];
  
  try {
    // Vérifier si l'utilisateur est admin/créateur
    const isAdmin = await checkAdminPermissions(userId);
    if (!isAdmin) {
      await bot.sendMessage(chatId, '❌ Vous n\'avez pas les permissions pour cette commande.');
      return;
    }

    // Valider l'URL APKPure
    if (!downloadUrl.includes('apkpure.com')) {
      await bot.sendMessage(chatId, '❌ Veuillez fournir une URL APKPure valide.');
      return;
    }

    // Message de confirmation
    const confirmMessage = `🚀 ENVOYER NOTIFICATION MISE À JOUR\n\n` +
                          `📱 Lien: ${downloadUrl}\n` +
                          `📲 Tous les utilisateurs avec l'app recevront une notification push\n\n` +
                          `Confirmer l'envoi ?`;
    
    await bot.sendMessage(chatId, confirmMessage, {
      reply_markup: {
        inline_keyboard: [[
          { text: '✅ Envoyer notification', callback_data: `send_push:${encodeURIComponent(downloadUrl)}` },
          { text: '❌ Annuler', callback_data: 'cancel_update' }
        ]]
      }
    });

  } catch (error) {
    console.error('Erreur commande /update:', error);
    await bot.sendMessage(chatId, '❌ Erreur lors de la préparation de la notification.');
  }
});
```

### 2. Gestion des callbacks
```javascript
// Dans votre handler callback_query existant :
if (data.startsWith('send_push:')) {
  const downloadUrl = decodeURIComponent(data.replace('send_push:', ''));
  
  if (!await checkAdminPermissions(userId)) {
    await bot.answerCallbackQuery(callbackQuery.id, { text: '❌ Non autorisé' });
    return;
  }

  await sendPushNotificationToAllUsers(downloadUrl, chatId, callbackQuery.message.message_id);
  
} else if (data === 'cancel_update') {
  await bot.editMessageText('❌ Envoi annulé.', {
    chat_id: chatId,
    message_id: callbackQuery.message.message_id
  });
}
```

### 3. Fonction d'envoi des notifications push
```javascript
async function sendPushNotificationToAllUsers(downloadUrl, adminChatId, messageId) {
  try {
    await bot.editMessageText('📲 ENVOI NOTIFICATIONS PUSH...', {
      chat_id: adminChatId,
      message_id: messageId
    });

    // Message de notification push
    const pushMessage = {
      title: '🚀 ATOMIC FLIX - Mise à jour disponible !',
      body: 'Nouvelles fonctionnalités et améliorations vous attendent ! Téléchargez la dernière version sur APKPure.',
      data: {
        type: 'app_update',
        downloadUrl: downloadUrl,
        action: 'download'
      }
    };

    const notificationsSent = await triggerPushNotifications(pushMessage);

    // Rapport final
    const report = `✅ NOTIFICATIONS ENVOYÉES\n\n` +
                  `💬 Titre: ${pushMessage.title}\n` +
                  `📝 Message: ${pushMessage.body}\n` +
                  `🔗 Lien: ${downloadUrl}\n` +
                  `📲 Notifications envoyées: ${notificationsSent}\n` +
                  `📅 ${new Date().toLocaleString('fr-FR')}`;

    await bot.editMessageText(report, {
      chat_id: adminChatId,
      message_id: messageId
    });

  } catch (error) {
    console.error('Erreur envoi notifications:', error);
    await bot.editMessageText(`❌ Erreur: ${error.message}`, {
      chat_id: adminChatId,
      message_id: messageId
    });
  }
}

async function triggerPushNotifications(pushMessage) {
  try {
    // Récupérer tous les tokens push des utilisateurs
    const { data: pushTokens, error } = await supabase
      .from('user_push_tokens')
      .select('push_token')
      .eq('is_active', true);

    if (error || !pushTokens?.length) return 0;

    // Envoyer via Expo Push Notifications
    const notifications = pushTokens.map(({ push_token }) => ({
      to: push_token,
      title: pushMessage.title,
      body: pushMessage.body,
      data: pushMessage.data,
      sound: 'default',
      badge: 1
    }));

    let totalSent = 0;
    const batchSize = 100;

    for (let i = 0; i < notifications.length; i += batchSize) {
      const batch = notifications.slice(i, i + batchSize);
      
      const response = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(batch),
      });

      if (response.ok) totalSent += batch.length;
    }

    return totalSent;
  } catch (error) {
    console.error('Erreur push notifications:', error);
    return 0;
  }
}
```

### 4. Fonction utilitaire
```javascript
async function checkAdminPermissions(userId) {
  const ADMIN_IDS = [123456789]; // Votre ID Telegram
  return ADMIN_IDS.includes(userId);
}
```

### 5. Table base de données nécessaire
```sql
CREATE TABLE user_push_tokens (
  id SERIAL PRIMARY KEY,
  push_token TEXT NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## 🚀 Comment ça fonctionne

1. **Vous tapez :** `/update https://apkpure.com/fr/atomic-flix/com.atomicflix.mobile/download`

2. **Le bot :** Envoie immédiatement des notifications push à tous les tokens enregistrés

3. **Les utilisateurs :** Reçoivent la notification push sur leur téléphone

4. **Ils cliquent :** La notification ouvre le lien APKPure pour télécharger directement !

**C'est tout ! Pas de base de données compliquée, juste une notification directe avec le lien.**