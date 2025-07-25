// Middleware de sécurité avancé pour bloquer les attaques même avec token volé

const AUTHORIZED_DOMAINS = [
  'atomic-flix-verifier-bot.vercel.app',
  'vercel.app',
  'localhost'
];

const AUTHORIZED_WEBHOOK_DOMAINS = [
  'atomic-flix-verifier-bot.vercel.app'
];

// Signatures de requêtes malveillantes connues
const MALICIOUS_PATTERNS = [
  'freeether.net',
  'FREE ETH',
  'Ethereum',
  'crypto',
  'Bitcoin',
  'claim free',
  'airdrop',
  'wallet connect'
];

class SecurityValidator {
  
  // Valider l'origine de la requête
  static validateOrigin(req) {
    const origin = req.headers.origin;
    const host = req.headers.host;
    const userAgent = req.headers['user-agent'] || '';
    
    console.log('Security check - Origin:', origin, 'Host:', host);
    
    // Vérifier si l'origine est autorisée
    if (origin && !AUTHORIZED_DOMAINS.some(domain => origin.includes(domain))) {
      console.log('🚨 BLOCKED: Unauthorized origin detected:', origin);
      return false;
    }
    
    // Bloquer les user-agents suspects
    if (userAgent.includes('bot') && !userAgent.includes('TelegramBot')) {
      console.log('🚨 BLOCKED: Suspicious user agent:', userAgent);
      return false;
    }
    
    return true;
  }
  
  // Valider le contenu des messages
  static validateMessageContent(messageText) {
    if (!messageText) return true;
    
    const lowerText = messageText.toLowerCase();
    
    for (const pattern of MALICIOUS_PATTERNS) {
      if (lowerText.includes(pattern.toLowerCase())) {
        console.log('🚨 BLOCKED: Malicious content detected:', pattern);
        return false;
      }
    }
    
    return true;
  }
  
  // Valider la structure des requêtes webhook
  static validateWebhookRequest(req) {
    const body = req.body;
    
    // Vérifier la structure Telegram valide
    if (!body || typeof body !== 'object') {
      console.log('🚨 BLOCKED: Invalid webhook structure');
      return false;
    }
    
    // Bloquer les requêtes sans update_id (signe de requête forgée)
    if (body.message && !body.update_id) {
      console.log('🚨 BLOCKED: Missing update_id in webhook');
      return false;
    }
    
    return true;
  }
  
  // Vérifier l'état du webhook en temps réel
  static async validateCurrentWebhook() {
    try {
      const token = process.env.BOT_TOKEN || '8136643576:AAEIwUDrBN_0LOn2eqQZdzhZZuFzaGgfNwg';
      const response = await fetch(`https://api.telegram.org/bot${token}/getWebhookInfo`);
      const data = await response.json();
      
      if (data.ok) {
        const currentWebhook = data.result.url;
        
        // Vérifier si le webhook est autorisé
        const isAuthorized = AUTHORIZED_WEBHOOK_DOMAINS.some(domain => 
          currentWebhook.includes(domain)
        );
        
        if (!isAuthorized && currentWebhook !== '') {
          console.log('🚨 CRITICAL: Unauthorized webhook detected:', currentWebhook);
          // Auto-cleanup
          await this.emergencyWebhookCleanup();
          return false;
        }
        
        return true;
      }
    } catch (error) {
      console.error('Error validating webhook:', error);
      return false;
    }
  }
  
  // Nettoyage automatique d'urgence
  static async emergencyWebhookCleanup() {
    try {
      const token = process.env.BOT_TOKEN || '8136643576:AAEIwUDrBN_0LOn2eqQZdzhZZuFzaGgfNwg';
      
      // Supprimer le webhook malveillant
      await fetch(`https://api.telegram.org/bot${token}/deleteWebhook`, {
        method: 'POST'
      });
      
      // Reconfigurer le webhook légitime
      await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: 'https://atomic-flix-verifier-bot.vercel.app/api/webhook'
        })
      });
      
      console.log('✅ Emergency cleanup completed');
      return true;
    } catch (error) {
      console.error('❌ Emergency cleanup failed:', error);
      return false;
    }
  }
}

// Middleware principal de sécurité
const securityMiddleware = async (req, res, next) => {
  try {
    console.log('🛡️ Security validation starting...');
    
    // 1. Valider l'origine
    if (!SecurityValidator.validateOrigin(req)) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized origin',
        blocked: true
      });
    }
    
    // 2. Valider la structure webhook
    if (!SecurityValidator.validateWebhookRequest(req)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid webhook request',
        blocked: true
      });
    }
    
    // 3. Valider le contenu des messages
    if (req.body && req.body.message && req.body.message.text) {
      if (!SecurityValidator.validateMessageContent(req.body.message.text)) {
        return res.status(403).json({
          success: false,
          error: 'Malicious content blocked',
          blocked: true
        });
      }
    }
    
    // 4. Vérifier l'état du webhook
    const webhookValid = await SecurityValidator.validateCurrentWebhook();
    if (!webhookValid) {
      return res.status(503).json({
        success: false,
        error: 'Security breach detected - system locked',
        blocked: true
      });
    }
    
    console.log('✅ Security validation passed');
    next();
    
  } catch (error) {
    console.error('Security middleware error:', error);
    return res.status(500).json({
      success: false,
      error: 'Security validation failed',
      blocked: true
    });
  }
};

module.exports = {
  securityMiddleware,
  SecurityValidator
};