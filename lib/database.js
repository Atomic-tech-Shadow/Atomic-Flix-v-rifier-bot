// Module de gestion intelligente avec PostgreSQL (Replit) et fallback (Vercel)
// Auto-détection de l'environnement pour compatibilité totale

const { FallbackTokenManager } = require('./storage-fallback');

let pool = null;
let isPostgresAvailable = false;

// Détection synchrone de l'environnement
function detectEnvironment() {
  // Si DATABASE_URL existe et que nous sommes dans un environnement persistant (Replit)
  if (process.env.DATABASE_URL && process.env.REPLIT_DB_URL) {
    isPostgresAvailable = true;
    console.log('✅ PostgreSQL environment detected (Replit)');
    return true;
  }
  
  // Sinon, utiliser le fallback (Vercel, développement local sans DB, etc.)
  console.log('⚠️  Using memory fallback (Vercel/Serverless environment)');
  isPostgresAvailable = false;
  return false;
}

// Initialisation PostgreSQL à la demande
async function initializePostgres() {
  if (!isPostgresAvailable) return false;
  
  if (!pool) {
    try {
      const { Pool } = require('pg');
      pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: false
      });
      
      // Test de connexion
      await pool.query('SELECT 1');
      console.log('✅ PostgreSQL database connected');
      return true;
      
    } catch (error) {
      console.log('⚠️  PostgreSQL connection failed, falling back to memory');
      isPostgresAvailable = false;
      pool = null;
      return false;
    }
  }
  return true;
}

// Détection d'environnement au chargement
detectEnvironment();

// Gestionnaire intelligent avec auto-détection d'environnement
class ExpoPushTokenManager {
  
  // Enregistrer ou mettre à jour un token
  static async registerToken(userId, pushToken, deviceInfo = {}) {
    if (isPostgresAvailable && await initializePostgres()) {
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
        
        console.log(`✅ Token registered/updated for user ${userId} (PostgreSQL)`);
        return result.rows[0];
        
      } catch (error) {
        console.error('PostgreSQL error, falling back to memory:', error);
        isPostgresAvailable = false;
        return await FallbackTokenManager.registerToken(userId, pushToken, deviceInfo);
      }
    } else {
      return await FallbackTokenManager.registerToken(userId, pushToken, deviceInfo);
    }
  }

  // Supprimer un token (marquer comme inactif)
  static async unregisterToken(userId) {
    if (isPostgresAvailable && await initializePostgres()) {
      try {
        const query = `
          UPDATE expo_push_tokens 
          SET is_active = false, updated_at = NOW() 
          WHERE user_id = $1 
          RETURNING *;
        `;
        
        const result = await pool.query(query, [userId.toString()]);
        
        console.log(`✅ Token unregistered for user ${userId} (PostgreSQL)`);
        return result.rows[0];
        
      } catch (error) {
        console.error('PostgreSQL error, falling back to memory:', error);
        isPostgresAvailable = false;
        return await FallbackTokenManager.unregisterToken(userId);
      }
    } else {
      return await FallbackTokenManager.unregisterToken(userId);
    }
  }

  // Mettre à jour la dernière activité
  static async updateLastActivity(userId) {
    if (isPostgresAvailable && await initializePostgres()) {
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
        console.error('PostgreSQL error, falling back to memory:', error);
        isPostgresAvailable = false;
        return await FallbackTokenManager.updateLastActivity(userId);
      }
    } else {
      return await FallbackTokenManager.updateLastActivity(userId);
    }
  }

  // Obtenir tous les tokens actifs (actifs dans les 30 derniers jours)
  static async getActiveTokens() {
    if (isPostgresAvailable && await initializePostgres()) {
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
        console.error('PostgreSQL error, falling back to memory:', error);
        isPostgresAvailable = false;
        return await FallbackTokenManager.getActiveTokens();
      }
    } else {
      return await FallbackTokenManager.getActiveTokens();
    }
  }

  // Obtenir les statistiques
  static async getStats() {
    if (isPostgresAvailable && await initializePostgres()) {
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
        console.error('PostgreSQL error, falling back to memory:', error);
        isPostgresAvailable = false;
        return await FallbackTokenManager.getStats();
      }
    } else {
      return await FallbackTokenManager.getStats();
    }
  }

  // Nettoyer les tokens très anciens (plus de 90 jours d'inactivité)
  static async cleanupOldTokens() {
    if (isPostgresAvailable && await initializePostgres()) {
      try {
        const query = `
          UPDATE expo_push_tokens 
          SET is_active = false, updated_at = NOW()
          WHERE is_active = true 
          AND last_active < NOW() - INTERVAL '90 days'
          RETURNING user_id;
        `;
        
        const result = await pool.query(query);
        console.log(`🧹 Cleaned up ${result.rows.length} old tokens (PostgreSQL)`);
        return result.rows.length;
        
      } catch (error) {
        console.error('Error cleaning old tokens:', error);
        isPostgresAvailable = false;
        return 0;
      }
    }
    return 0; // Pas de nettoyage en mode fallback
  }

  // Obtenir l'environnement de stockage actuel
  static getStorageEnvironment() {
    return {
      type: isPostgresAvailable ? 'PostgreSQL' : 'Memory Fallback',
      persistent: isPostgresAvailable,
      environment: isPostgresAvailable ? 'Replit' : 'Vercel',
      unlimited: true,
      free: true
    };
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