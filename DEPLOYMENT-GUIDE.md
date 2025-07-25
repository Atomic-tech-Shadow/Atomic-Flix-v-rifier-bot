# Guide de Déploiement Vercel - ATOMIC FLIX Bot

## Fichiers à synchroniser avec Vercel

### 1. Configuration Vercel mise à jour
- `vercel.json` - Maintenant inclut `api/update-command.js`

### 2. Code à déployer sur Vercel
Tous ces fichiers doivent être présents dans votre dépôt Vercel:

#### API Endpoints
- `api/health.js`
- `api/verify-subscription.js` 
- `api/bot-info.js`
- `api/send-message.js`
- `api/webhook.js` (avec support de /update)
- `api/set-commands.js`
- `api/update-command.js` ⭐ **NOUVEAU - À AJOUTER**



#### Bibliothèques
- `lib/telegramBot.js`
- `lib/svgImageGenerator.js`
- `lib/logoConverter.js`

#### Configuration
- `package.json`
- `vercel.json` (mis à jour)
- `index.js`

## Étapes de déploiement

1. **Commit tous les fichiers vers votre repo Git**
2. **Push vers la branche principale**  
3. **Vercel déploiera automatiquement**
4. **Reconfigurer le webhook vers Vercel**

## Webhook final
Une fois déployé, configurer:
```
https://atomic-flix-verifier-bot.vercel.app/api/webhook
```