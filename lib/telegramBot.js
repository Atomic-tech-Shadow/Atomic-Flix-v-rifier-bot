const TelegramBot = require('node-telegram-bot-api');

// Initialize bot with token from environment variables
const getBotInstance = () => {
  const token = process.env.BOT_TOKEN;
  
  if (!token) {
    throw new Error('BOT_TOKEN environment variable is required');
  }
  
  // Create bot instance without polling (for serverless)
  const bot = new TelegramBot(token, { polling: false });
  return bot;
};

// Get bot information
const getBotInfo = async () => {
  try {
    const bot = getBotInstance();
    const me = await bot.getMe();
    return {
      success: true,
      bot: me,
      channelId: process.env.CHANNEL_ID || '@Atomic_flix_officiel'
    };
  } catch (error) {
    console.error('Error getting bot info:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Verify user subscription to channel
const verifySubscription = async (userId) => {
  try {
    const bot = getBotInstance();
    const channelId = process.env.CHANNEL_ID || '@Atomic_flix_officiel';
    
    if (!userId) {
      return {
        isSubscribed: false,
        status: 'invalid_user_id',
        error: 'User ID is required'
      };
    }
    
    console.log(`Checking subscription for user ${userId} in channel ${channelId}`);
    
    // Get chat member info
    const member = await bot.getChatMember(channelId, userId);
    
    // Check if user is subscribed (member, administrator, or creator)
    const subscribedStatuses = ['member', 'administrator', 'creator'];
    const isSubscribed = subscribedStatuses.includes(member.status);
    
    console.log(`User ${userId} status: ${member.status}, subscribed: ${isSubscribed}`);
    
    return {
      isSubscribed,
      status: member.status,
      userInfo: {
        user: member.user,
        can_be_edited: member.can_be_edited,
        can_manage_chat: member.can_manage_chat,
        can_change_info: member.can_change_info,
        can_delete_messages: member.can_delete_messages,
        can_invite_users: member.can_invite_users,
        can_restrict_members: member.can_restrict_members,
        can_pin_messages: member.can_pin_messages,
        can_promote_members: member.can_promote_members,
        can_send_messages: member.can_send_messages,
        can_send_media_messages: member.can_send_media_messages,
        can_send_polls: member.can_send_polls,
        can_send_other_messages: member.can_send_other_messages,
        can_add_web_page_previews: member.can_add_web_page_previews
      }
    };
    
  } catch (error) {
    console.error('Error verifying subscription:', error);
    
    // Handle specific Telegram API errors
    if (error.code === 'ETELEGRAM') {
      const errorMessage = error.response?.body?.description || error.message;
      
      if (errorMessage.includes('user not found')) {
        return {
          isSubscribed: false,
          status: 'user_not_found',
          error: 'User not found'
        };
      }
      
      if (errorMessage.includes('chat not found')) {
        return {
          isSubscribed: false,
          status: 'channel_not_found',
          error: 'Channel not found'
        };
      }
      
      if (errorMessage.includes('Unauthorized')) {
        return {
          isSubscribed: false,
          status: 'unauthorized',
          error: 'Bot is not authorized to access this channel'
        };
      }
      
      if (errorMessage.includes('Bad Request: user not found')) {
        return {
          isSubscribed: false,
          status: 'user_not_found',
          error: 'User not found'
        };
      }
      
      if (errorMessage.includes('left')) {
        return {
          isSubscribed: false,
          status: 'left',
          error: 'User has left the channel'
        };
      }
      
      if (errorMessage.includes('kicked')) {
        return {
          isSubscribed: false,
          status: 'kicked',
          error: 'User was kicked from the channel'
        };
      }
    }
    
    return {
      isSubscribed: false,
      status: 'error',
      error: error.message
    };
  }
};

module.exports = {
  getBotInstance,
  getBotInfo,
  verifySubscription
};
