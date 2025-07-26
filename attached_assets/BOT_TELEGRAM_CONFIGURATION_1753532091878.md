# 🤖 CONFIGURATION BOT TELEGRAM - ATOMIC FLIX

## Vue d'ensemble

Le bot Telegram envoie des messages à l'ID fixe `atomic_flix_mobile_v1` via une API serveur. Voici comment tout configurer.

## Architecture simple

```
Bot Telegram → API Serveur → Stockage messages → App mobile (vérification périodique)
```

## 1. Configuration du serveur API

### Endpoints requis

```javascript
// server.js (Node.js + Express)
const express = require('express');
const app = express();

// Stockage en mémoire (ou base de données)
let messages = {};

// Endpoint pour recevoir messages du bot
app.post('/api/send-message', (req, res) => {
  const { appId, message } = req.body;
  
  if (!messages[appId]) {
    messages[appId] = [];
  }
  
  // Ajouter le message avec timestamp
  messages[appId].push({
    id: Date.now().toString(),
    ...message,
    timestamp: new Date().toISOString()
  });
  
  console.log(`📬 Message envoyé à ${appId}:`, message.title);
  res.json({ success: true });
});

// Endpoint pour l'app mobile (vérification messages)
app.get('/api/check-messages/:appId', (req, res) => {
  const { appId } = req.params;
  const appMessages = messages[appId] || [];
  
  // Retourner messages non expirés (dernières 24h)
  const validMessages = appMessages.filter(msg => {
    const messageTime = new Date(msg.timestamp);
    const now = new Date();
    return (now - messageTime) < 24 * 60 * 60 * 1000; // 24h
  });
  
  // Nettoyer après envoi
  if (validMessages.length > 0) {
    messages[appId] = [];
  }
  
  res.json({ messages: validMessages });
});

app.listen(3000, () => {
  console.log('🚀 Serveur API démarré sur port 3000');
});
```

## 2. Configuration du Bot Telegram

### Script bot principal

```javascript
// bot.js
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

const bot = new TelegramBot('TON_BOT_TOKEN', { polling: true });
const API_URL = 'https://ton-serveur.com'; // URL de ton serveur

// Commande pour envoyer message à toutes les apps
bot.onText(/\/message (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  
  // Vérifier si c'est l'admin (remplace par ton ID Telegram)
  if (userId !== TON_USER_ID_ADMIN) {
    bot.sendMessage(chatId, '❌ Accès refusé');
    return;
  }
  
  const input = match[1];
  const parts = input.split('"').filter(part => part.trim());
  
  if (parts.length < 2) {
    bot.sendMessage(chatId, '❌ Format: /message "Titre" "Message" [URL]');
    return;
  }
  
  const title = parts[0].trim();
  const message = parts[1].trim();
  const downloadUrl = parts[2] ? parts[2].trim() : null;
  
  try {
    // Envoyer à l'API serveur
    await axios.post(`${API_URL}/api/send-message`, {
      appId: 'atomic_flix_mobile_v1',
      message: {
        title,
        message,
        downloadUrl,
        buttonText: downloadUrl ? '📥 Télécharger' : 'OK'
      }
    });
    
    bot.sendMessage(chatId, `✅ Message envoyé à toutes les apps ATOMIC FLIX\n\n📝 Titre: ${title}\n💬 Message: ${message}${downloadUrl ? `\n🔗 Lien: ${downloadUrl}` : ''}`);
    
  } catch (error) {
    console.error('Erreur envoi message:', error);
    bot.sendMessage(chatId, '❌ Erreur lors de l\'envoi du message');
  }
});

// Commande d'aide
bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, `
🤖 *ATOMIC FLIX Bot*

Commandes disponibles:

/message "Titre" "Message" [URL]
   Envoie un message à toutes les apps

Exemple:
/message "Nouvelle version" "Version 2.9.1 disponible !" https://apkpure.com/atomic-flix

/help - Affiche cette aide
  `, { parse_mode: 'Markdown' });
});

console.log('🤖 Bot Telegram démarré');
```

## 3. Configuration complète étape par étape

### Étape 1: Créer le serveur API

```bash
# Créer dossier serveur
mkdir atomic-flix-server
cd atomic-flix-server

# Initialiser projet Node.js
npm init -y
npm install express cors axios

# Créer server.js avec le code ci-dessus
```

### Étape 2: Créer le bot Telegram

```bash
# Dans le même dossier ou séparé
npm install node-telegram-bot-api

# Créer bot.js avec le code ci-dessus
```

### Étape 3: Configuration des variables

```javascript
// config.js
module.exports = {
  BOT_TOKEN: 'ton_token_bot_telegram',
  ADMIN_USER_ID: 123456789, // Ton ID Telegram
  API_URL: 'https://ton-serveur.herokuapp.com', // URL de déploiement
  APP_ID: 'atomic_flix_mobile_v1' // ID fixe de l'app
};
```

### Étape 4: Déploiement

#### Option A: Heroku
```bash
# Créer Procfile
echo "web: node server.js" > Procfile
echo "worker: node bot.js" > Procfile

# Déployer sur Heroku
git init
git add .
git commit -m "Initial commit"
heroku create atomic-flix-api
git push heroku main
```

#### Option B: Vercel
```json
// vercel.json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/server.js"
    }
  ]
}
```

## 4. Test du système

### Tester l'API serveur
```bash
# Envoyer un message test
curl -X POST https://ton-serveur.com/api/send-message \
  -H "Content-Type: application/json" \
  -d '{
    "appId": "atomic_flix_mobile_v1",
    "message": {
      "title": "Test",
      "message": "Message de test",
      "downloadUrl": "https://example.com"
    }
  }'

# Vérifier les messages
curl https://ton-serveur.com/api/check-messages/atomic_flix_mobile_v1
```

### Tester le bot Telegram
1. Envoie `/help` au bot
2. Envoie `/message "Test" "Ceci est un test"`
3. Vérifie que l'app reçoit le message

## 5. Configuration finale dans l'app

### Mettre à jour l'URL du serveur

```typescript
// Dans SimpleMessageService.ts
constructor() {
  this.serverUrl = 'https://ton-serveur-deploy.com'; // ⬅️ Mettre la vraie URL
}
```

## Exemple d'utilisation

### Envoyer une mise à jour
```
/message "ATOMIC FLIX v2.9.1" "Nouvelle version avec corrections de bugs disponible ! 🚀" https://apkpure.com/fr/atomic-flix/com.atomicflix.mobile
```

### Envoyer une annonce
```
/message "Maintenance programmée" "L'application sera en maintenance ce soir de 23h à 1h du matin."
```

### Envoyer une info
```
/message "Nouveautés anime" "50 nouveaux épisodes ajoutés cette semaine ! Découvrez-les maintenant."
```

## Sécurité

- ✅ Vérification ID admin dans le bot
- ✅ HTTPS obligatoire pour l'API
- ✅ Messages expirés automatiquement (24h)
- ✅ Pas de données sensibles stockées

---

**Important**: Remplace `TON_BOT_TOKEN`, `TON_USER_ID_ADMIN` et `https://ton-serveur.com` par tes vraies valeurs !