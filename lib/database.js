// Module de gestion de la base de données PostgreSQL pour stockage persistant
// Totalement gratuit et illimité avec Replit PostgreSQL

const { Pool } = require('pg');

// Configuration automatique de la connexion PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false // Pas besoin de SSL pour base locale Replit
});

// Test de connexion
pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('❌ Database connection error:', err);
});

// Fonctions pour la gestion des tokens Expo Push
class ExpoPushTokenManager {
  
  // Enregistrer ou mettre à jour un token
  static async registerToken(userId, pushToken, deviceInfo = {}) {
    try {
      const query = `
        INSERT INTO expo_push_tokens (user_id, push_token, device_info, registered_at, last_active) 
        VALUES ($1, $2, $3, NOW(), NOW())
        ON CONFLICT (user_id) 
        DO UPDATE SET 
          push_token = EXCLUDED.push_token,
          device_info = EXCLUDED.device_info,
          last_active = NOW(),
          updated_at = NOW(),
          is_active = true
        RETURNING *;
      `;
      
      const values = [userId.toString(), pushToken, JSON.stringify(deviceInfo)];
      const result = await pool.query(query, values);
      
      console.log(`✅ Token registered/updated for user ${userId}`);
      return result.rows[0];
      
    } catch (error) {
      console.error('Error registering token:', error);
      throw error;
    }
  }

  // Supprimer un token (marquer comme inactif)
  static async unregisterToken(userId) {
    try {
      const query = `
        UPDATE expo_push_tokens 
        SET is_active = false, updated_at = NOW() 
        WHERE user_id = $1 
        RETURNING *;
      `;
      
      const result = await pool.query(query, [userId.toString()]);
      
      console.log(`✅ Token unregistered for user ${userId}`);
      return result.rows[0];
      
    } catch (error) {
      console.error('Error unregistering token:', error);
      throw error;
    }
  }

  // Mettre à jour la dernière activité
  static async updateLastActivity(userId) {
    try {
      const query = `
        UPDATE expo_push_tokens 
        SET last_active = NOW(), updated_at = NOW() 
        WHERE user_id = $1 AND is_active = true 
        RETURNING *;
      `;
      
      const result = await pool.query(query, [userId.toString()]);
      return result.rows[0];
      
    } catch (error) {
      console.error('Error updating last activity:', error);
      throw error;
    }
  }

  // Obtenir tous les tokens actifs (actifs dans les 30 derniers jours)
  static async getActiveTokens() {
    try {
      const query = `
        SELECT push_token, user_id, device_info, last_active 
        FROM expo_push_tokens 
        WHERE is_active = true 
        AND last_active > NOW() - INTERVAL '30 days'
        ORDER BY last_active DESC;
      `;
      
      const result = await pool.query(query);
      return result.rows.map(row => row.push_token);
      
    } catch (error) {
      console.error('Error getting active tokens:', error);
      throw error;
    }
  }

  // Obtenir les statistiques
  static async getStats() {
    try {
      const totalQuery = `SELECT COUNT(*) as total FROM expo_push_tokens WHERE is_active = true;`;
      const activeQuery = `
        SELECT COUNT(*) as active 
        FROM expo_push_tokens 
        WHERE is_active = true 
        AND last_active > NOW() - INTERVAL '30 days';
      `;
      const recentQuery = `
        SELECT user_id, registered_at, last_active 
        FROM expo_push_tokens 
        WHERE is_active = true 
        ORDER BY registered_at DESC 
        LIMIT 10;
      `;
      
      const [totalResult, activeResult, recentResult] = await Promise.all([
        pool.query(totalQuery),
        pool.query(activeQuery),
        pool.query(recentQuery)
      ]);
      
      return {
        totalUsers: parseInt(totalResult.rows[0].total),
        activeUsers: parseInt(activeResult.rows[0].active),
        recentRegistrations: recentResult.rows
      };
      
    } catch (error) {
      console.error('Error getting stats:', error);
      throw error;
    }
  }

  // Nettoyer les tokens très anciens (plus de 90 jours d'inactivité)
  static async cleanupOldTokens() {
    try {
      const query = `
        UPDATE expo_push_tokens 
        SET is_active = false, updated_at = NOW()
        WHERE is_active = true 
        AND last_active < NOW() - INTERVAL '90 days'
        RETURNING user_id;
      `;
      
      const result = await pool.query(query);
      console.log(`🧹 Cleaned up ${result.rows.length} old tokens`);
      return result.rows.length;
      
    } catch (error) {
      console.error('Error cleaning old tokens:', error);
      throw error;
    }
  }
}

// Nettoyer automatiquement les anciens tokens chaque jour
setInterval(() => {
  ExpoPushTokenManager.cleanupOldTokens();
}, 24 * 60 * 60 * 1000); // 24 heures

module.exports = {
  pool,
  ExpoPushTokenManager
};