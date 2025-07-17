#!/bin/bash

echo "🚀 Configuration rapide du bot ATOMIC FLIX"
echo "=========================================="

# 1. Configuration du webhook
echo "1. Configuration du webhook..."
node deploy-ready-bot.js

# 2. Test des endpoints
echo "2. Test des endpoints..."
echo "Testing root endpoint..."
curl -s https://atomic-flix-verifier-bot.vercel.app/ | head -c 100
echo ""

echo "Testing webhook endpoint..."
curl -s -X POST https://atomic-flix-verifier-bot.vercel.app/api/webhook \
  -H "Content-Type: application/json" \
  -d '{"test": "ping"}' | head -c 100
echo ""

# 3. Vérification finale
echo "3. Vérification finale..."
echo "✅ Bot configuré: @Atomic_flix_verifier_bot"
echo "✅ Canal: @Atomic_flix_officiel"
echo "✅ Webhook: https://atomic-flix-verifier-bot.vercel.app/api/webhook"
echo ""
echo "🔗 Testez votre bot: https://t.me/Atomic_flix_verifier_bot"
echo "📱 Envoyez /start pour commencer"

echo ""
echo "🚀 Déploiement terminé!"