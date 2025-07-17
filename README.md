# 🤖 ATOMIC FLIX Telegram Backend

Backend Node.js déployé sur Vercel pour vérifier les abonnements Telegram du canal @Atomic_flix_officiel pour l'application mobile ATOMIC FLIX.

## 🚀 Déploiement

### Variables d'environnement requises

- `BOT_TOKEN` : Token du bot Telegram (obtenu via @BotFather)
- `CHANNEL_ID` : @Atomic_flix_officiel (configuré par défaut)

### Commandes de déploiement

```bash
# Installation locale
npm install

# Test local
npm start

# Déploiement sur Vercel
vercel --prod
```

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

**Réponse - Utilisateur non abonné :**
```json
{
  "success": true,
  "isSubscribed": false,
  "status": "left",
  "channel": {
    "id": "@Atomic_flix_officiel"
  }
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

## 🔧 Gestion des erreurs

L'API gère automatiquement les erreurs Telegram courantes :
- `user_not_found` : Utilisateur inexistant
- `channel_not_found` : Canal introuvable
- `unauthorized` : Bot non autorisé
- `left` : Utilisateur a quitté le canal
- `kicked` : Utilisateur exclu du canal

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