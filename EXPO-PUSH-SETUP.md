# Configuration Expo Push Notifications - ATOMIC FLIX

## 🚀 Configuration du Token Expo

### Étape 1: Configurer le Token de Base Expo
```bash
curl -X POST https://atomic-flix-verifier-bot.vercel.app/api/expo-push \
  -H "Content-Type: application/json" \
  -d '{
    "action": "set_expo_token",
    "expoToken": "VOTRE_TOKEN_EXPO_ICI"
  }'
```

### Étape 2: Tester la Configuration
```bash
curl -X POST https://atomic-flix-verifier-bot.vercel.app/api/expo-push \
  -H "Content-Type: application/json" \
  -d '{
    "action": "get_stats"
  }'
```

## 📱 Fonctionnalités Expo Push

### ✅ **API Endpoints Disponibles:**

1. **Configurer Token Expo** - `/api/expo-push`
   - Action: `set_expo_token`
   - Configure le token d'accès Expo principal

2. **Enregistrer Token Utilisateur** - `/api/expo-push`
   - Action: `register_user_token`
   - Enregistre le token push d'un utilisateur

3. **Envoyer Notifications** - `/api/expo-push`
   - Action: `send_push`
   - Envoie des notifications à tous les utilisateurs

4. **Statistiques** - `/api/expo-push`
   - Action: `get_stats`
   - Affiche les stats du système push

### 🔧 **Intégration avec /update:**

La commande `/update` utilise maintenant automatiquement:
- ✅ **Vraies notifications Expo** si token configuré
- ✅ **Simulation** si token non configuré (fallback)
- ✅ **Rapport détaillé** avec succès/erreurs
- ✅ **Support URLs longues** avec stockage temporaire

## 📋 **Format des Notifications:**

```json
{
  "title": "🚀 ATOMIC FLIX - Mise à jour disponible !",
  "body": "Nouvelles fonctionnalités et améliorations vous attendent !",
  "data": {
    "type": "app_update", 
    "downloadUrl": "https://apkpure.com/...",
    "action": "download"
  }
}
```

## 🎯 **Workflow Complet:**

1. **Admin lance**: `/update https://apkpure.com/fr/atomic-flix/com.atomicflix.mobile/download`
2. **Bot affiche**: Message de confirmation avec boutons
3. **Admin confirme**: Clique "✅ Envoyer notification"
4. **Système envoie**: Notifications Expo à tous les utilisateurs
5. **Bot rapporte**: Statistiques détaillées (envoyées/erreurs)

## ⚡ **Avantages:**

- **Notifications instantanées** via Expo Push Service
- **Gestion automatique** des tokens utilisateurs
- **Fallback intelligent** si Expo non configuré
- **Rapports détaillés** avec statistiques
- **Compatible** avec toutes les URLs APKPure

**Prêt pour production une fois le token Expo fourni!** 🚀