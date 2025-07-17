# 🚀 Guide de déploiement Vercel pour ATOMIC FLIX Backend

## 📋 Configuration pour Vercel

### 1. Framework à choisir
**Framework : Node.js** (pas Next.js ni React)

### 2. Root Directory
**Root Directory : `.`** (racine du projet)

### 3. Configuration automatique détectée
Vercel détectera automatiquement :
- **Build Command** : `npm install` (automatique)
- **Output Directory** : `api/` (fonctions serverless)
- **Install Command** : `npm install` (automatique)

## 🔧 Fichiers de configuration

### vercel.json (déjà configuré)
```json
{
  "version": 2,
  "builds": [
    {
      "src": "api/**/*.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/$1"
    }
  ],
  "functions": {
    "api/health.js": {
      "maxDuration": 10
    },
    "api/verify-subscription.js": {
      "maxDuration": 15
    }
  }
}
```

### package.json (configuré)
```json
{
  "name": "workspace",
  "version": "1.0.0",
  "dependencies": {
    "express": "^5.1.0",
    "node-telegram-bot-api": "^0.66.0"
  }
}
```

## 🚀 Étapes de déploiement

### Méthode 1 : Via GitHub (recommandée)

1. **Pousser le code sur GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit - ATOMIC FLIX Backend"
   git branch -M main
   git remote add origin https://github.com/votre-username/atomic-flix-backend.git
   git push -u origin main
   ```

2. **Connecter à Vercel**
   - Aller sur [vercel.com](https://vercel.com)
   - Cliquer "New Project"
   - Importer votre repo GitHub
   - **Framework Preset** : Other
   - **Root Directory** : `.` (laisser vide)
   - **Build Command** : laisser vide (auto-détection)
   - **Output Directory** : laisser vide (auto-détection)

### Méthode 2 : Via Vercel CLI

1. **Installer Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Déployer**
   ```bash
   vercel --prod
   ```

3. **Suivre les prompts**
   - Set up and deploy? `Y`
   - Which scope? Choisir votre compte
   - Link to existing project? `N`
   - Project name? `atomic-flix-backend`
   - Directory? `.` (racine)

## 🔧 Variables d'environnement

### Sur Vercel Dashboard
1. Aller dans Settings → Environment Variables
2. Ajouter (optionnel car le token est déjà dans le code) :
   ```
   BOT_TOKEN = 8136643576:AAEIwUDrBN_0LOn2eqQZdzhZZuFzaGgfNwg
   CHANNEL_ID = @Atomic_flix_officiel
   ```

### Structure des endpoints après déploiement
```
https://votre-app.vercel.app/api/health
https://votre-app.vercel.app/api/verify-subscription
https://votre-app.vercel.app/api/bot-info
https://votre-app.vercel.app/api/send-message
https://votre-app.vercel.app/api/webhook
https://votre-app.vercel.app/api/set-commands
https://votre-app.vercel.app/api/get-user-id
https://votre-app.vercel.app/api/growth-features
https://votre-app.vercel.app/api/anime-promotion
```

## 🧪 Test après déploiement

### Test de santé
```bash
curl https://votre-app.vercel.app/api/health
```

### Test de vérification
```bash
curl -X POST https://votre-app.vercel.app/api/verify-subscription \
  -H "Content-Type: application/json" \
  -d '{"userId": "6968736907"}'
```

### Test promotion anime
```bash
curl -X POST https://votre-app.vercel.app/api/anime-promotion \
  -H "Content-Type: application/json" \
  -d '{"action": "send_anime_welcome", "userId": "6968736907"}'
```

## ⚠️ Points importants

### 1. Framework
- **CHOISIR** : Other ou Node.js
- **NE PAS CHOISIR** : Next.js, React, Vue.js

### 2. Root Directory
- **LAISSER VIDE** ou mettre `.`
- **NE PAS METTRE** : `api/` ou autre sous-dossier

### 3. Build Settings
- **Build Command** : laisser vide (auto-détection)
- **Output Directory** : laisser vide (auto-détection)
- **Install Command** : laisser vide (auto-détection)

### 4. Fonctions détectées
Vercel créera automatiquement une fonction serverless pour chaque fichier :
- `api/health.js` → `/api/health`
- `api/verify-subscription.js` → `/api/verify-subscription`
- `api/anime-promotion.js` → `/api/anime-promotion`
- etc.

## 🔧 Résolution des problèmes

### Erreur "Framework not detected"
- Choisir manuellement "Other"
- Vérifier que `package.json` est à la racine

### Erreur "Build failed"
- Vérifier les dépendances dans `package.json`
- S'assurer que `vercel.json` est correct

### Erreur "Function timeout"
- Augmenter `maxDuration` dans `vercel.json`
- Optimiser le code pour être plus rapide

### Erreur "Environment variable"
- Ajouter `BOT_TOKEN` dans Vercel Dashboard
- Ou utiliser le token direct dans le code (déjà fait)

## 📱 Mise à jour de votre app React Native

Une fois déployé, mettre à jour `src/config/api.js` :

```javascript
const API_CONFIG = {
  BASE_URL: 'https://votre-app.vercel.app', // Remplacer par votre URL
  ENDPOINTS: {
    HEALTH: '/api/health',
    VERIFY_SUBSCRIPTION: '/api/verify-subscription',
    ANIME_PROMOTION: '/api/anime-promotion'
  }
};
```

## 🎯 Résumé des choix Vercel

**Lors du déploiement, choisir :**
- **Framework** : Other
- **Root Directory** : `.` (ou laisser vide)
- **Build Command** : (laisser vide)
- **Output Directory** : (laisser vide)

Vercel s'occupera du reste automatiquement grâce à `vercel.json` !