const https = require('https');

// Script de surveillance automatique de la sécurité du bot
const BOT_TOKEN = '8136643576:AAEIwUDrBN_0LOn2eqQZdzhZZuFzaGgfNwg';
const EXPECTED_WEBHOOK = 'https://atomic-flix-verifier-bot.vercel.app/api/webhook';

async function checkBotSecurity() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.telegram.org',
      port: 443,
      path: `/bot${BOT_TOKEN}/getWebhookInfo`,
      method: 'POST'
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        const result = JSON.parse(data);
        
        if (result.ok) {
          const webhookInfo = result.result;
          const currentWebhook = webhookInfo.url;
          
          console.log('=== VÉRIFICATION SÉCURITÉ BOT ===');
          console.log(`Webhook actuel: ${currentWebhook}`);
          console.log(`Webhook attendu: ${EXPECTED_WEBHOOK}`);
          
          if (currentWebhook === EXPECTED_WEBHOOK) {
            console.log('✅ SÉCURITÉ OK - Webhook correct');
            resolve({ secure: true, webhook: currentWebhook });
          } else if (currentWebhook === '') {
            console.log('⚠️  ATTENTION - Aucun webhook configuré');
            resolve({ secure: false, webhook: 'NONE', issue: 'NO_WEBHOOK' });
          } else {
            console.log('🚨 ALERTE SÉCURITÉ - Webhook non autorisé détecté!');
            console.log(`Webhook malveillant: ${currentWebhook}`);
            resolve({ secure: false, webhook: currentWebhook, issue: 'UNAUTHORIZED_WEBHOOK' });
          }
        } else {
          reject(new Error('Impossible de vérifier le webhook'));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
}

// Fonction pour nettoyer automatiquement en cas d'intrusion
async function emergencyCleanup() {
  return new Promise((resolve, reject) => {
    console.log('🛡️  ACTIVATION NETTOYAGE D\'URGENCE...');
    
    const data = JSON.stringify({ url: EXPECTED_WEBHOOK });
    
    const options = {
      hostname: 'api.telegram.org',
      port: 443,
      path: `/bot${BOT_TOKEN}/setWebhook`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        const result = JSON.parse(responseData);
        
        if (result.ok) {
          console.log('✅ Webhook restauré avec succès');
          resolve(true);
        } else {
          console.log('❌ Échec de la restauration:', result.description);
          resolve(false);
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(data);
    req.end();
  });
}

// Exécution du contrôle
checkBotSecurity()
  .then(async (securityStatus) => {
    if (!securityStatus.secure) {
      if (securityStatus.issue === 'UNAUTHORIZED_WEBHOOK') {
        console.log('🚨 INTRUSION DÉTECTÉE - Activation du nettoyage automatique');
        await emergencyCleanup();
      }
    }
    
    console.log('\n=== RAPPORT FINAL ===');
    console.log(`Status: ${securityStatus.secure ? 'SÉCURISÉ' : 'COMPROMIS'}`);
    console.log(`Webhook: ${securityStatus.webhook}`);
    console.log(`Date: ${new Date().toISOString()}`);
  })
  .catch(error => {
    console.error('Erreur lors de la vérification:', error);
  });

module.exports = { checkBotSecurity, emergencyCleanup };