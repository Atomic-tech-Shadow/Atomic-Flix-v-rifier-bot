const https = require('https');

const replit_domain = "18c89921-94fe-4edd-8553-68318cc04414-00-v7nwrujyv1ip.janeway.replit.dev";
const webhook_url = `https://${replit_domain}/api/webhook`;
const bot_token = "8136643576:AAEIwUDrBN_0LOn2eqQZdzhZZuFzaGgfNwg";

console.log("Configuring webhook to point to Replit server with /update command...");
console.log("Webhook URL:", webhook_url);

const data = JSON.stringify({
  url: webhook_url
});

const options = {
  hostname: 'api.telegram.org',
  port: 443,
  path: `/bot${bot_token}/setWebhook`,
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
    console.log('Response:', responseData);
    const result = JSON.parse(responseData);
    
    if (result.ok) {
      console.log('✅ Webhook configured successfully!');
      console.log('The /update command should now work on Telegram');
    } else {
      console.log('❌ Failed to configure webhook:', result.description);
    }
  });
});

req.on('error', (error) => {
  console.error('Error:', error);
});

req.write(data);
req.end();