# 🚀 Guide de Déploiement ATOMIC FLIX Bot

## Configuration Finale

Votre bot est maintenant prêt pour le déploiement avec la configuration suivante :

- **Bot Username**: @Atomic_flix_verifier_bot
- **Channel**: @Atomic_flix_officiel
- **Webhook**: https://atomic-flix-verifier-bot.vercel.app/api/webhook

## Déploiement sur Vercel

### 1. Configuration Vercel
```
Framework Preset: Other
Root Directory: ./
Build Command: (laisser vide)
Install Command: (laisser vide)
Output Directory: (laisser vide)
```

### 2. Variables d'environnement (optionnel)
```
BOT_TOKEN=8136643576:AAEIwUDrBN_0LOn2eqQZdzhZZuFzaGgfNwg
CHANNEL_ID=@Atomic_flix_officiel
```

### 3. Après déploiement
```bash
# Configurez le webhook
node deploy-ready-bot.js
```

## Déploiement sur Railway

### 1. Connectez votre repository GitHub
### 2. Déployez avec ces paramètres:
```
Start Command: node server.js
```

### 3. Ajoutez les variables d'environnement dans Railway:
```
BOT_TOKEN=8136643576:AAEIwUDrBN_0LOn2eqQZdzhZZuFzaGgfNwg
CHANNEL_ID=@Atomic_flix_officiel
WEBHOOK_URL=https://votre-app.railway.app/api/webhook
```

## Déploiement sur Render

### 1. Créez un nouveau Web Service
### 2. Connectez votre repository
### 3. Configuration:
```
Build Command: npm install
Start Command: node server.js
```

### 4. Variables d'environnement:
```
BOT_TOKEN=8136643576:AAEIwUDrBN_0LOn2eqQZdzhZZuFzaGgfNwg
CHANNEL_ID=@Atomic_flix_officiel
WEBHOOK_URL=https://votre-app.onrender.com/api/webhook
```

## Test du Bot

Une fois déployé, testez votre bot:

1. Allez sur https://t.me/Atomic_flix_verifier_bot
2. Envoyez `/start`
3. Cliquez sur "Vérifier mon abonnement"
4. Le bot devrait répondre avec le statut d'abonnement

## Endpoints Disponibles

- `GET /` - Information sur l'API
- `GET /api/health` - Statut du bot
- `POST /api/verify-subscription` - Vérifier abonnement
- `POST /api/webhook` - Webhook Telegram
- `GET /api/bot-info` - Informations détaillées du bot

## Dépannage

### Bot ne répond pas
1. Vérifiez que le webhook est configuré
2. Testez les endpoints API
3. Vérifiez les logs de déploiement

### Erreur 404 sur les endpoints
1. Vérifiez la configuration du framework
2. Assurez-vous que le Root Directory est correct
3. Redéployez l'application

### Problème de vérification d'abonnement
1. Vérifiez que le bot est admin du canal
2. Assurez-vous que CHANNEL_ID est correct
3. Testez avec un utilisateur abonné au canal

## Support

En cas de problème, vérifiez :
- Les logs de déploiement
- La configuration du webhook
- Les permissions du bot sur le canal