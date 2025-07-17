const { getBotInstance } = require('./lib/telegramBot');

async function finalWebhookSetup() {
  try {
    const bot = getBotInstance();
    
    console.log('🔧 Final webhook setup...');
    
    // Step 1: Delete existing webhook
    console.log('1. Deleting existing webhook...');
    await bot.deleteWebHook();
    
    // Step 2: Set webhook with the correct endpoint
    console.log('2. Setting webhook to /api/webhook...');
    const webhookUrl = 'https://atomic-flix-verifier-bot.vercel.app/api/webhook';
    const result = await bot.setWebHook(webhookUrl);
    console.log('Webhook set result:', result);
    
    // Step 3: Wait a bit and verify
    console.log('3. Waiting 2 seconds...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const webhookInfo = await bot.getWebHookInfo();
    console.log('Webhook info:', webhookInfo);
    
    // Step 4: Test with bot info
    const botInfo = await bot.getMe();
    console.log('Bot info:', botInfo);
    
    console.log('✅ Final setup complete!');
    console.log('Bot username:', botInfo.username);
    console.log('Webhook URL:', webhookInfo.url);
    
    if (webhookInfo.last_error_message) {
      console.log('⚠️ Last error:', webhookInfo.last_error_message);
    } else {
      console.log('✅ No webhook errors!');
    }
    
  } catch (error) {
    console.error('❌ Setup error:', error);
  }
}

finalWebhookSetup();