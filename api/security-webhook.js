// Webhook avec token de sécurité unique - Même si le token Telegram est volé, ils ne peuvent pas utiliser ce webhook

const crypto = require('crypto');
const { getBotInstance } = require('../lib/telegramBot');

// Token de sécurité unique généré automatiquement
const SECURITY_TOKEN = 'atomic_flix_secure_2025_' + crypto.randomBytes(16).toString('hex');

// Domaines autorisés uniquement
const AUTHORIZED_IPS = [
  '149.154.160.0/20',
  '91.108.4.0/22',
  // IPs Telegram officielles
];

// Fonction pour valider l'IP Telegram
function isValidTelegramIP(clientIP) {
  const telegramIPs = [
    '149.154.160.', '149.154.161.', '149.154.162.', '149.154.163.',
    '149.154.164.', '149.154.165.', '149.154.166.', '149.154.167.',
    '91.108.4.', '91.108.5.', '91.108.6.', '91.108.7.'
  ];
  
  return telegramIPs.some(ip => clientIP.startsWith(ip));
}

module.exports = async (req, res) => {
  try {
    console.log('🛡️ SECURE WEBHOOK - Validation starting...');
    
    // 1. Vérifier le token de sécurité dans l'URL
    const securityToken = req.query.security_token;
    if (!securityToken || securityToken !== SECURITY_TOKEN) {
      console.log('🚨 BLOCKED: Invalid security token');
      return res.status(403).json({
        success: false,
        error: 'Access denied - Invalid security credentials'
      });
    }
    
    // 2. Vérifier l'IP source (Telegram uniquement)
    const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress || '';
    if (!isValidTelegramIP(clientIP)) {
      console.log('🚨 BLOCKED: Non-Telegram IP:', clientIP);
      return res.status(403).json({
        success: false,
        error: 'Access denied - Invalid source'
      });
    }
    
    // 3. Valider la signature Telegram (si configurée)
    const telegramSignature = req.headers['x-telegram-bot-api-secret-token'];
    if (telegramSignature && telegramSignature !== 'atomic_flix_webhook_2025') {
      console.log('🚨 BLOCKED: Invalid Telegram signature');
      return res.status(403).json({
        success: false,
        error: 'Invalid webhook signature'
      });
    }
    
    // 4. Vérifier la méthode HTTP
    if (req.method !== 'POST') {
      return res.status(405).json({
        success: false,
        error: 'Method not allowed'
      });
    }
    
    // 5. Valider la structure du body
    const update = req.body;
    if (!update || !update.update_id) {
      console.log('🚨 BLOCKED: Invalid update structure');
      return res.status(400).json({
        success: false,
        error: 'Invalid update format'
      });
    }
    
    console.log('✅ SECURE WEBHOOK - All validations passed');
    console.log('Processing legitimate update:', update.update_id);
    
    // Traitement normal du webhook ici
    const bot = getBotInstance();
    
    // Handle messages
    if (update.message && update.message.text) {
      const chatId = update.message.chat.id;
      const text = update.message.text;
      const userId = update.message.from.id;
      
      // Bloquer les contenus suspects même après validation
      const suspiciousContent = ['free eth', 'ethereum', 'crypto', 'bitcoin', 'airdrop'];
      if (suspiciousContent.some(word => text.toLowerCase().includes(word))) {
        console.log('🚨 BLOCKED: Suspicious message content detected');
        return res.status(200).json({ success: true, blocked: true });
      }
      
      // Traitement normal des commandes
      if (text.startsWith('/start')) {
        await bot.sendMessage(chatId, 
          `🎬 Bienvenue sur ATOMIC FLIX !\n\n` +
          `Je suis votre assistant sécurisé pour vérifier votre abonnement au canal @Atomic_flix_officiel.\n\n` +
          `Utilisez /verify pour vérifier votre abonnement.`,
          {
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: '✅ Vérifier mon abonnement',
                    callback_data: 'verify_subscription'
                  }
                ],
                [
                  {
                    text: '📱 Rejoindre le canal',
                    url: 'https://t.me/Atomic_flix_officiel'
                  }
                ]
              ]
            }
          }
        );
      }
      // Autres commandes...
    }
    
    return res.status(200).json({ 
      success: true, 
      secure: true,
      processed: true
    });
    
  } catch (error) {
    console.error('Secure webhook error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal security error'
    });
  }
};

// Exporter le token de sécurité pour configuration
module.exports.SECURITY_TOKEN = SECURITY_TOKEN;
console.log('🔐 SECURE WEBHOOK INITIALIZED - Token:', SECURITY_TOKEN);