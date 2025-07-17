
const https = require('https');

async function configureWebhook() {
  try {
    const token = process.env.BOT_TOKEN || '8136643576:AAEIwUDrBN_0LOn2eqQZdzhZZuFzaGgfNwg';
    const webhookUrl = 'https://atomic-flix-verifier-bot.vercel.app/api/webhook';
    
    console.log('🔧 Configuration du webhook Telegram...');
    console.log('URL:', webhookUrl);
    
    // Supprimer l'ancien webhook
    console.log('📡 Suppression de l\'ancien webhook...');
    const deleteUrl = `https://api.telegram.org/bot${token}/deleteWebhook`;
    await makeRequest(deleteUrl, 'POST', {});
    console.log('✅ Ancien webhook supprimé');
    
    // Configurer le nouveau webhook
    console.log('📡 Configuration du nouveau webhook...');
    const setUrl = `https://api.telegram.org/bot${token}/setWebhook`;
    const setResult = await makeRequest(setUrl, 'POST', { url: webhookUrl });
    console.log('✅ Nouveau webhook configuré:', setResult);
    
    // Vérifier le webhook
    console.log('📡 Vérification du webhook...');
    const infoUrl = `https://api.telegram.org/bot${token}/getWebhookInfo`;
    const webhookInfo = await makeRequest(infoUrl, 'GET', {});
    console.log('📡 Informations du webhook:', webhookInfo);
    
    if (webhookInfo.result && webhookInfo.result.url === webhookUrl) {
      console.log('🎉 Webhook configuré avec succès !');
      console.log('Les commandes Telegram fonctionneront maintenant via Vercel');
      console.log('🔗 URL configurée:', webhookInfo.result.url);
      console.log('✅ Pending updates:', webhookInfo.result.pending_update_count || 0);
    } else {
      console.log('❌ Erreur de configuration du webhook');
      console.log('URL attendue:', webhookUrl);
      console.log('URL configurée:', webhookInfo.result?.url || 'aucune');
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de la configuration:', error);
  }
}

function makeRequest(url, method, data) {
  return new Promise((resolve, reject) => {
    const postData = method === 'POST' ? JSON.stringify(data) : null;
    
    const options = {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': postData ? Buffer.byteLength(postData) : 0
      }
    };
    
    const req = https.request(url, options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(body);
          resolve(result);
        } catch (e) {
          resolve({ body });
        }
      });
    });
    
    req.on('error', reject);
    
    if (postData) {
      req.write(postData);
    }
    
    req.end();
  });
}

configureWebhook();
