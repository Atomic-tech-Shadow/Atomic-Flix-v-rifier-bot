const { Pool } = require('pg');

// Pool PostgreSQL avec configuration d'environnement
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

module.exports = {
  // Ajouter un message
  addMessage: async (appId, message) => {
    try {
      const messageWithId = {
        id: Date.now().toString(),
        ...message,
        timestamp: new Date().toISOString()
      };

      // Insérer dans la table app_messages
      const query = `
        INSERT INTO app_messages (app_id, message_id, title, message_text, download_url, button_text, timestamp)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (app_id, message_id) DO NOTHING
      `;
      
      await pool.query(query, [
        appId,
        messageWithId.id,
        messageWithId.title,
        messageWithId.message,
        messageWithId.downloadUrl || null,
        messageWithId.buttonText || 'OK',
        messageWithId.timestamp
      ]);

      console.log(`📬 Message ajouté en BDD pour ${appId}:`, message.title);
      return messageWithId;
    } catch (error) {
      console.error('Erreur ajout message BDD:', error);
      throw error;
    }
  },

  // Récupérer les messages valides (dernières 24h)
  getValidMessages: async (appId) => {
    try {
      const query = `
        SELECT message_id as id, title, message_text as message, download_url as downloadUrl, 
               button_text as buttonText, timestamp
        FROM app_messages 
        WHERE app_id = $1 
        AND timestamp > NOW() - INTERVAL '24 hours'
        ORDER BY timestamp DESC
      `;
      
      const result = await pool.query(query, [appId]);
      const messages = result.rows.map(row => ({
        ...row,
        downloadUrl: row.downloadurl
      }));

      console.log(`📱 App ${appId} a vérifié les messages BDD: ${messages.length} trouvés`);
      return messages;
    } catch (error) {
      console.error('Erreur récupération messages BDD:', error);
      return [];
    }
  },

  // Nettoyer les messages après lecture
  clearMessages: async (appId) => {
    try {
      const result = await pool.query(
        'DELETE FROM app_messages WHERE app_id = $1',
        [appId]
      );
      
      console.log(`🧹 ${result.rowCount} messages nettoyés en BDD pour ${appId}`);
    } catch (error) {
      console.error('Erreur nettoyage messages BDD:', error);
    }
  },

  // Nettoyer les anciens messages (plus de 24h)
  cleanupOldMessages: async () => {
    try {
      const result = await pool.query(
        "DELETE FROM app_messages WHERE timestamp < NOW() - INTERVAL '24 hours'"
      );
      
      console.log(`🧹 ${result.rowCount} anciens messages supprimés automatiquement`);
    } catch (error) {
      console.error('Erreur nettoyage automatique:', error);
    }
  },

  // Obtenir toutes les stats de messages
  getAllStats: async () => {
    try {
      const query = `
        SELECT app_id,
               COUNT(*) as total,
               COUNT(CASE WHEN timestamp > NOW() - INTERVAL '24 hours' THEN 1 END) as valid
        FROM app_messages 
        GROUP BY app_id
      `;
      
      const result = await pool.query(query);
      const stats = {};
      
      result.rows.forEach(row => {
        stats[row.app_id] = {
          total: parseInt(row.total),
          valid: parseInt(row.valid)
        };
      });
      
      return stats;
    } catch (error) {
      console.error('Erreur obtention stats BDD:', error);
      return {};
    }
  },

  // Initialiser la table si elle n'existe pas
  initTable: async () => {
    try {
      const query = `
        CREATE TABLE IF NOT EXISTS app_messages (
          id SERIAL PRIMARY KEY,
          app_id VARCHAR(100) NOT NULL,
          message_id VARCHAR(50) NOT NULL,
          title VARCHAR(255) NOT NULL,
          message_text TEXT NOT NULL,
          download_url TEXT,
          button_text VARCHAR(100) DEFAULT 'OK',
          timestamp TIMESTAMPTZ DEFAULT NOW(),
          UNIQUE(app_id, message_id)
        );
        
        CREATE INDEX IF NOT EXISTS idx_app_messages_app_id_timestamp 
        ON app_messages(app_id, timestamp DESC);
      `;
      
      await pool.query(query);
      console.log('📊 Table app_messages initialisée');
    } catch (error) {
      console.error('Erreur initialisation table:', error);
    }
  }
};