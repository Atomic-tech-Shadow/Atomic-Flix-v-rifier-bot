# Guide de Sécurité - ATOMIC FLIX Bot

## Incident de Sécurité Résolu (25/07/2025)

### Problème Identifié
- Un webhook malveillant était configuré sur `botelegram.work.gd`
- Interceptait tous les messages du bot
- Envoyait du spam concernant des cryptomonnaies

### Actions Correctives Prises
- ✅ Webhook malveillant supprimé
- ✅ Commandes du bot réinitialisées
- ✅ Bot entièrement sécurisé
- ✅ Fonctionnalité normale rétablie

## Recommandations de Sécurité

### 1. Protection du Token
- Ne jamais partager le token du bot
- Utiliser des variables d'environnement en production
- Changer le token si compromis

### 2. Surveillance des Webhooks
Vérifier régulièrement avec:
```bash
curl -X POST "https://api.telegram.org/bot[TOKEN]/getWebhookInfo"
```

### 3. Commandes de Sécurité d'Urgence
```bash
# Supprimer tous les webhooks
curl -X POST "https://api.telegram.org/bot[TOKEN]/deleteWebhook"

# Réinitialiser les commandes
curl -X POST "https://api.telegram.org/bot[TOKEN]/setMyCommands" -d '{"commands":[]}'
```

### 4. Signes de Compromission
- Messages inattendus du bot
- Comportement anormal des commandes
- Réponses non programmées

## État Actuel
🟢 **BOT SÉCURISÉ** - Toutes les fonctionnalités normales restaurées