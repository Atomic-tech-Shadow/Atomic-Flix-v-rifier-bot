# 🤖 INSTRUCTIONS POUR IA - Backend Telegram Vercel

## 📝 CONTEXTE
Tu dois créer un backend Node.js sur Vercel pour vérifier les abonnements Telegram du canal @Atomic_flix_officiel pour l'application mobile ATOMIC FLIX.

## 🎯 MISSION PRÉCISE
1. Créer un projet Node.js compatible Vercel
2. Implémenter l'API Telegram Bot avec `node-telegram-bot-api`
3. Créer 2 endpoints : `/api/health` et `/api/verify-subscription`
4. Configurer le déploiement Vercel avec variables d'environnement

## 📁 STRUCTURE EXACTE À CRÉER

```
atomic-flix-telegram-vercel/
├── package.json
├── vercel.json
├── .env.example
├── api/
│   ├── health.js
│   └── verify-subscription.js
└── lib/
    └── telegramBot.js
```

## 🔧 SPÉCIFICATIONS TECHNIQUES

### Variables d'environnement requises
- `BOT_TOKEN` : Token du bot Telegram (format: 1234567890:ABCDEF...)
- `CHANNEL_ID` : @Atomic_flix_officiel

### Endpoints requis

#### 1. GET /api/health
- Vérifie le statut du bot avec `bot.getMe()`
- Retourne informations du bot et configuration
- Status 200 si OK, 503 si erreur

#### 2. POST /api/verify-subscription
- Body: `{ userId: "123456789" }`
- Utilise `bot.getChatMember(CHANNEL_ID, userId)`
- Vérifie si `member.status` est dans `['member', 'administrator', 'creator']`
- Retourne `{ isSubscribed: boolean, status: string, userInfo: object }`

### Gestion des erreurs Telegram
- "user not found" → `{ isSubscribed: false, status: 'user_not_found' }`
- "chat not found" → `{ isSubscribed: false, status: 'channel_not_found' }`
- "Unauthorized" → `{ isSubscribed: false, status: 'unauthorized' }`

### Configuration Vercel
- Runtime Node.js 18+
- Build avec `@vercel/node`
- CORS activé pour React Native
- Variables d'environnement configurées

## 📋 CHECKLIST DE LIVRAISON

### ✅ Fichiers créés
- [ ] package.json avec `node-telegram-bot-api`
- [ ] vercel.json avec configuration builds
- [ ] lib/telegramBot.js avec logique bot
- [ ] api/health.js endpoint de santé
- [ ] api/verify-subscription.js endpoint principal
- [ ] .env.example avec variables

### ✅ Fonctionnalités implémentées
- [ ] Vérification d'abonnement avec `getChatMember`
- [ ] Gestion complète des erreurs Telegram
- [ ] CORS configuré pour mobile
- [ ] Validation des données d'entrée
- [ ] Logs pour debugging

### ✅ Tests de déploiement
- [ ] `vercel dev` fonctionne localement
- [ ] `vercel deploy` réussit
- [ ] `/api/health` retourne status "OK"
- [ ] `/api/verify-subscription` répond correctement

## 🚀 COMMANDES DE DÉPLOIEMENT

```bash
# Installation
npm install node-telegram-bot-api

# Test local
vercel dev

# Déploiement
vercel --prod
```

## 🧪 TESTS À EFFECTUER

### Test health endpoint
```bash
curl https://votre-app.vercel.app/api/health
```

### Test verification endpoint
```bash
curl -X POST https://votre-app.vercel.app/api/verify-subscription \
  -H "Content-Type: application/json" \
  -d '{"userId": "123456789"}'
```

## 🎯 RÉSULTAT ATTENDU

URL de production fonctionnelle (https://atomic-flix-telegram.vercel.app) avec :
- Endpoint `/api/health` opérationnel
- Endpoint `/api/verify-subscription` fonctionnel
- Configuration des variables d'environnement
- Documentation de test

## 📞 LIVRAISON

Fournir :
- URL du backend déployé
- Confirmation que les endpoints fonctionnent
- Instructions pour configurer BOT_TOKEN dans Vercel

## 🔍 RÉFÉRENCE COMPLÈTE

Consulter `VERCEL_DEPLOYMENT_GUIDE.md` pour tous les détails techniques et le code complet de chaque fichier.

---

**🎯 OBJECTIF : Backend Vercel prêt pour intégration avec l'application mobile ATOMIC FLIX**