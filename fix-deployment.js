const { getBotInstance } = require('./lib/telegramBot');

async function fixDeployment() {
  try {
    const bot = getBotInstance();
    
    console.log('🔧 Fixing deployment issues...');
    
    // Step 1: Delete existing webhook
    console.log('1. Deleting existing webhook...');
    await bot.deleteWebHook();
    
    // Step 2: Set webhook again
    console.log('2. Setting new webhook...');
    const webhookUrl = 'https://atomic-flix-verifier-bot.vercel.app/api/webhook-handler';
    const result = await bot.setWebHook(webhookUrl);
    console.log('Webhook set result:', result);
    
    // Step 3: Verify webhook
    console.log('3. Verifying webhook...');
    const webhookInfo = await bot.getWebHookInfo();
    console.log('Webhook info:', webhookInfo);
    
    // Step 4: Test bot with a simple message
    console.log('4. Testing bot...');
    const botInfo = await bot.getMe();
    console.log('Bot info:', botInfo);
    
    // Step 5: Update bot description
    await bot.setMyDescription('🎬 Bot officiel ATOMIC FLIX pour vérifier les abonnements au canal @Atomic_flix_officiel');
    
    // Step 6: Set bot commands
    const commands = [
      {
        command: 'start',
        description: '🎬 Démarrer le bot ATOMIC FLIX'
      },
      {
        command: 'verify',
        description: '✅ Vérifier votre abonnement'
      },
      {
        command: 'help',
        description: '❓ Obtenir de l\'aide'
      }
    ];
    
    await bot.setMyCommands(commands);
    console.log('5. Bot commands updated');
    
    console.log('✅ Deployment fixed successfully!');
    console.log('Your bot should now respond to messages at @Atomic_flix_verifier_bot');
    
  } catch (error) {
    console.error('❌ Error fixing deployment:', error);
    console.error('Full error:', error.response?.body || error.message);
  }
}

fixDeployment();