# Intégration App Mobile ATOMIC FLIX - Push Notifications

## 📱 Comment les Tokens Push sont Enregistrés

### Méthode 1: Depuis l'App Mobile (Recommandé)

L'app mobile ATOMIC FLIX doit faire un appel API au démarrage:

```javascript
// Dans l'app mobile React Native/Expo
import * as Notifications from 'expo-notifications';

async function registerForPushNotifications() {
  // Obtenir le token push
  const token = await Notifications.getExpoPushTokenAsync();
  
  // Obtenir l'ID utilisateur (depuis votre système d'auth)
  const userId = await getUserId(); // Votre fonction
  
  // Enregistrer le token sur le serveur
  const response = await fetch('https://atomic-flix-verifier-bot.vercel.app/api/register-push-token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      action: 'register',
      userId: userId,
      pushToken: token.data,
      deviceInfo: {
        platform: Platform.OS,
        version: Device.osVersion
      }
    })
  });
  
  const result = await response.json();
  console.log('Push token registered:', result);
}
```

### Méthode 2: Via Bot Telegram (Manuel)

Les utilisateurs peuvent aussi s'enregistrer via le bot:

```
/register_push ExponentPushToken[xxxxxx]
```

### Méthode 3: API Directe (Test/Debug)

Pour les tests, appel direct à l'API:

```bash
curl -X POST https://atomic-flix-verifier-bot.vercel.app/api/register-push-token \
  -H "Content-Type: application/json" \
  -d '{
    "action": "register",
    "userId": "12345",
    "pushToken": "ExponentPushToken[xxxxxxxxxxxxxx]",
    "deviceInfo": {
      "platform": "android",
      "version": "11"
    }
  }'
```

## 🔄 Cycle de Vie des Tokens

### Enregistrement Automatique:
1. **App se lance** → Génère token push
2. **App appelle API** → Enregistre token sur serveur  
3. **Token stocké** → Prêt pour notifications

### Mise à Jour Activité:
```javascript
// Appeler périodiquement pour maintenir le token actif
fetch('/api/register-push-token', {
  method: 'POST',
  body: JSON.stringify({
    action: 'update_activity',
    userId: userId
  })
});
```

### Désenregistrement:
```javascript
// Quand l'utilisateur se déconnecte
fetch('/api/register-push-token', {
  method: 'POST', 
  body: JSON.stringify({
    action: 'unregister',
    userId: userId
  })
});
```

## 📊 Statistiques et Monitoring

### Voir les Tokens Enregistrés:
```bash
curl -X POST https://atomic-flix-verifier-bot.vercel.app/api/register-push-token \
  -H "Content-Type: application/json" \
  -d '{"action": "get_stats"}'
```

### Réponse Exemple:
```json
{
  "success": true,
  "stats": {
    "totalUsers": 150,
    "activeUsers": 120,
    "registrationDates": [...]
  }
}
```

## 🚀 Flow Complet

1. **Utilisateur installe** l'app ATOMIC FLIX
2. **App génère** token push Expo automatiquement
3. **App enregistre** token via `/api/register-push-token`
4. **Admin utilise** `/update` sur Telegram
5. **Système envoie** notifications à tous les tokens actifs
6. **Utilisateurs reçoivent** notification avec lien APKPure

## ⚡ Avantages

- **Enregistrement automatique** depuis l'app mobile
- **Gestion de l'activité** (tokens inactifs ignorés)
- **API simple** pour intégration
- **Statistiques** en temps réel
- **Compatible** avec le système de sécurité existant

**L'app mobile doit juste appeler l'API d'enregistrement au démarrage!** 📱