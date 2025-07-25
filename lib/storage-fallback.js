// Système de fallback pour compatibilité Vercel/Replit
// Utilise PostgreSQL si disponible, sinon stockage en mémoire avec session persistence

const memoryStorage = new Map();

class FallbackTokenManager {
  static async registerToken(userId, pushToken, deviceInfo = {}) {
    try {
      const tokenData = {
        pushToken: pushToken,
        deviceInfo: deviceInfo,
        registeredAt: new Date().toISOString(),
        lastActive: new Date().toISOString(),
        isActive: true
      };
      
      memoryStorage.set(userId.toString(), tokenData);
      console.log(`✅ Token registered in memory for user ${userId}`);
      
      return {
        user_id: userId,
        push_token: pushToken,
        device_info: deviceInfo,
        registered_at: tokenData.registeredAt,
        last_active: tokenData.lastActive
      };
      
    } catch (error) {
      console.error('Error registering token in fallback:', error);
      throw error;
    }
  }

  static async unregisterToken(userId) {
    try {
      const existed = memoryStorage.has(userId.toString());
      if (existed) {
        const tokenData = memoryStorage.get(userId.toString());
        tokenData.isActive = false;
        memoryStorage.set(userId.toString(), tokenData);
      }
      
      console.log(`✅ Token unregistered in memory for user ${userId}`);
      return existed ? { user_id: userId } : null;
      
    } catch (error) {
      console.error('Error unregistering token in fallback:', error);
      throw error;
    }
  }

  static async updateLastActivity(userId) {
    try {
      const tokenData = memoryStorage.get(userId.toString());
      if (tokenData && tokenData.isActive) {
        tokenData.lastActive = new Date().toISOString();
        memoryStorage.set(userId.toString(), tokenData);
        return { user_id: userId };
      }
      return null;
      
    } catch (error) {
      console.error('Error updating last activity in fallback:', error);
      throw error;
    }
  }

  static async getActiveTokens() {
    try {
      const tokens = [];
      const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
      
      for (const [userId, data] of memoryStorage.entries()) {
        if (data.isActive && new Date(data.lastActive).getTime() > thirtyDaysAgo) {
          tokens.push(data.pushToken);
        }
      }
      
      return tokens;
      
    } catch (error) {
      console.error('Error getting active tokens in fallback:', error);
      throw error;
    }
  }

  static async getStats() {
    try {
      const allTokens = Array.from(memoryStorage.values());
      const activeTokens = allTokens.filter(data => data.isActive);
      const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
      const recentlyActive = activeTokens.filter(data => 
        new Date(data.lastActive).getTime() > thirtyDaysAgo
      );
      
      const recentRegistrations = Array.from(memoryStorage.entries())
        .filter(([_, data]) => data.isActive)
        .sort((a, b) => new Date(b[1].registeredAt) - new Date(a[1].registeredAt))
        .slice(0, 10)
        .map(([userId, data]) => ({
          user_id: userId,
          registered_at: data.registeredAt,
          last_active: data.lastActive
        }));
      
      return {
        totalUsers: activeTokens.length,
        activeUsers: recentlyActive.length,
        recentRegistrations
      };
      
    } catch (error) {
      console.error('Error getting stats in fallback:', error);
      throw error;
    }
  }
}

module.exports = { FallbackTokenManager };