// Analyse de l'attaque sur le bot ATOMIC FLIX
const attackDetails = {
  webhook_malveillant: {
    url: "https://botelegram.work.gd/tg/callback?bot_id=123735",
    ip_address: "91.210.108.145",
    date_detection: "2025-07-25T15:40:00Z"
  },
  
  methode_attaque: {
    type: "Webhook hijacking",
    description: "L'attaquant a configuré un webhook externe pour intercepter tous les messages",
    impact: "Tous les messages du bot étaient redirigés vers le serveur malveillant"
  },
  
  origine_probable: [
    "Token de bot exposé publiquement (GitHub, Pastebin, etc.)",
    "Fuite de token via un service tiers compromis",
    "Accès non autorisé aux credentials",
    "Token hardcodé dans le code source visible"
  ],
  
  actions_malveillantes: {
    spam_content: "Messages frauduleux sur Ethereum/crypto",
    target: "Utilisateurs du bot ATOMIC FLIX",
    but: "Probablement escroquerie financière"
  }
};

console.log("=== ANALYSE DE L'ATTAQUE ===");
console.log(JSON.stringify(attackDetails, null, 2));

// Vérifier l'IP malveillante
const net = require('net');
console.log("\n=== INFORMATIONS IP ATTAQUANT ===");
console.log(`IP: ${attackDetails.webhook_malveillant.ip_address}`);
console.log("Cette IP appartient probablement à un hébergeur utilisé pour des activités malveillantes");