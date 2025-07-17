# 🤖 ATOMIC FLIX Telegram Backend

Backend Node.js déployé sur Vercel pour vérifier les abonnements Telegram du canal @Atomic_flix_officiel pour l'application mobile ATOMIC FLIX.

## 🚀 Backend Déployé

**URL de Production :** https://atomic-flix-verifier-bot.vercel.app/

### Configuration

- `BOT_TOKEN` : Token du bot Telegram intégré directement dans le code
- `CHANNEL_ID` : @Atomic_flix_officiel (configuré par défaut)

**Note :** Le token du bot est maintenant intégré directement dans `lib/telegramBot.js`, aucune variable d'environnement n'est requise.

## 📡 Endpoints API

### 1. GET /api/health

Vérifie le statut du bot et la configuration.

**Réponse exemple :**
```json
{
  "success": true,
  "status": "healthy",
  "bot": {
    "id": 8136643576,
    "username": "Atomic_flix_verifier_bot",
    "firstName": "ATOMIC FLIX VÉRIFIER",
    "isBot": true
  },
  "channel": {
    "id": "@Atomic_flix_officiel",
    "configured": false
  },
  "environment": {
    "botTokenConfigured": true,
    "channelIdConfigured": false
  }
}
```

### 2. POST /api/verify-subscription

Vérifie l'abonnement d'un utilisateur au canal.

**Requête :**
```json
{
  "userId": "123456789"
}
```

**Réponse - Utilisateur abonné :**
```json
{
  "success": true,
  "isSubscribed": true,
  "status": "member",
  "userInfo": {
    "user": {
      "id": 123456789,
      "is_bot": false,
      "first_name": "John",
      "username": "john_doe"
    }
  },
  "channel": {
    "id": "@Atomic_flix_officiel"
  }
}
```

### 3. GET /api/bot-info

Informations détaillées sur le bot et ses fonctionnalités.

**Réponse exemple :**
```json
{
  "success": true,
  "bot": {
    "id": 8136643576,
    "username": "Atomic_flix_verifier_bot",
    "firstName": "ATOMIC FLIX VÉRIFIER",
    "canJoinGroups": true,
    "supportsInlineQueries": false
  },
  "commands": [
    {
      "command": "start",
      "description": "🎬 Démarrer le bot ATOMIC FLIX"
    },
    {
      "command": "verify",
      "description": "✅ Vérifier votre abonnement au canal"
    },
    {
      "command": "help",
      "description": "❓ Afficher l'aide et les commandes"
    }
  ],
  "features": {
    "subscriptionVerification": true,
    "inlineKeyboards": true,
    "commandHandling": true,
    "messageDelivery": true
  }
}
```

### 4. POST /api/send-message

Envoie un message à un utilisateur avec clavier inline optionnel.

**Requête :**
```json
{
  "userId": "123456789",
  "message": "🎬 Bienvenue sur ATOMIC FLIX !",
  "useInlineKeyboard": true
}
```

**Réponse :**
```json
{
  "success": true,
  "message": "Message sent successfully",
  "sentMessage": {
    "messageId": 4,
    "chatId": 123456789,
    "text": "🎬 Bienvenue sur ATOMIC FLIX !",
    "hasInlineKeyboard": true
  }
}
```

### 5. POST /api/set-commands

Configure les commandes du bot dans Telegram.

**Réponse :**
```json
{
  "success": true,
  "message": "Bot commands configured successfully",
  "commands": [
    {
      "command": "start",
      "description": "🎬 Démarrer le bot ATOMIC FLIX"
    },
    {
      "command": "verify",
      "description": "✅ Vérifier votre abonnement au canal"
    },
    {
      "command": "help",
      "description": "❓ Afficher l'aide et les commandes"
    }
  ]
}
```

### 6. POST /api/webhook

Gestionnaire de webhook pour recevoir les mises à jour Telegram en temps réel.

**Fonctionnalités :**
- Gère les messages texte et les commandes
- Traite les interactions avec les boutons inline
- Répond automatiquement aux commandes `/start`, `/verify`, `/help`
- Vérifie les abonnements en temps réel

### 7. GET /api/get-user-id

Récupère les IDs des utilisateurs ayant récemment interagi avec le bot.

**Réponse :**
```json
{
  "success": true,
  "users": [
    {
      "userId": 123456789,
      "username": "john_doe",
      "firstName": "John",
      "text": "Hello bot!",
      "date": "2025-07-17T13:54:22.822Z"
    }
  ]
}
```

## 🧪 Tests

### Test du health check
```bash
curl https://votre-app.vercel.app/api/health
```

### Test de vérification d'abonnement
```bash
curl -X POST https://votre-app.vercel.app/api/verify-subscription \
  -H "Content-Type: application/json" \
  -d '{"userId": "123456789"}'
```

### Test d'envoi de message
```bash
curl -X POST https://votre-app.vercel.app/api/send-message \
  -H "Content-Type: application/json" \
  -d '{"userId": "123456789", "message": "Hello!", "useInlineKeyboard": true}'
```

### Test d'informations du bot
```bash
curl https://votre-app.vercel.app/api/bot-info
```

### Configuration des commandes
```bash
curl -X POST https://votre-app.vercel.app/api/set-commands
```

## 🔧 Gestion des erreurs

L'API gère automatiquement les erreurs Telegram courantes :
- `user_not_found` : Utilisateur inexistant
- `channel_not_found` : Canal introuvable
- `unauthorized` : Bot non autorisé
- `left` : Utilisateur a quitté le canal
- `kicked` : Utilisateur exclu du canal
- `blocked_by_user` : Utilisateur a bloqué le bot
- `chat_not_found` : Chat introuvable

## 🎯 Fonctionnalités avancées

### Boutons interactifs (Inline Keyboards)
- Boutons pour vérifier l'abonnement
- Liens directs vers le canal
- Interactions sans envoi de messages

### Commandes bot automatiques
- `/start` : Accueil avec boutons interactifs
- `/verify` : Vérification d'abonnement instantanée
- `/help` : Aide et liste des commandes

### Gestion des messages
- Envoi de messages personnalisés
- Support des boutons inline
- Gestion des erreurs de livraison

### Webhook et temps réel
- Traitement des messages en temps réel
- Réponses automatiques aux commandes
- Gestion des interactions utilisateur

## 📱 Intégration React Native

L'API est configurée avec CORS pour fonctionner avec les applications React Native. Tous les endpoints retournent des réponses JSON structurées.

## 🔐 Sécurité

- Token du bot stocké en variable d'environnement
- Validation des données d'entrée
- Gestion complète des erreurs
- Logs détaillés pour le debugging

## 📊 Monitoring

- Endpoint `/api/health` pour vérifier le statut
- Logs détaillés dans la console
- Gestion des timeouts Vercel (10s health, 15s verification)

---

**Backend prêt pour intégration avec l'application mobile ATOMIC FLIX** ✅