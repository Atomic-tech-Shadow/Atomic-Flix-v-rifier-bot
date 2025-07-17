const { getBotInstance } = require('./lib/telegramBot');

async function testUsernameResolution() {
  try {
    const bot = getBotInstance();
    
    console.log('Testing with username: @Ghost_Cid');
    
    // Test with your username
    const result = await bot.getChatMember('@Atomic_flix_officiel', '@Ghost_Cid');
    console.log('Success! User found:', result);
    
  } catch (error) {
    console.log('Error details:', error.message);
    
    // If username doesn't work, let's try some alternatives
    if (error.message.includes('PARTICIPANT_ID_INVALID')) {
      console.log('❌ Username resolution failed - need numeric user ID');
      console.log('Pour obtenir votre ID utilisateur, vous pouvez :');
      console.log('1. Envoyer un message à @userinfobot sur Telegram');
      console.log('2. Ou envoyer un message à notre bot et je récupérerai votre ID');
    }
  }
}

testUsernameResolution();