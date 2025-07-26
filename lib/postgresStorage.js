const { Pool } = require('pg');

// Configuration PostgreSQL pour Vercel avec retry et logging
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('localhost') ? false : { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

// Test initial de connexion avec logging détaillé
pool.on('connect', () => {
  console.log('🔗 PostgreSQL connecté avec succès');
});

pool.on('error', (err) => {
  console.error('❌ Erreur PostgreSQL:', err);
});

module.exports = {
  // Ajouter un message avec retry automatique
  addMessage: async (appId, message) => {
    let retries = 3;
    while (retries > 0) {
      try {
        console.log(`🔄 Tentative d'ajout message BDD (${4-retries}/3)`);
        
        const messageWithId = {
          id: Date.now().toString(),
          ...message,
          timestamp: new Date().toISOString()
        };

        // Vérifier d'abord la connexion
        await pool.query('SELECT 1');
        console.log('✅ Connexion PostgreSQL OK');

        // Créer la table si elle n'existe pas
        await initTable();

        // Insérer le message
        const query = `
          INSERT INTO app_messages (app_id, message_id, title, message_text, download_url, button_text, timestamp)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          ON CONFLICT (app_id, message_id) DO UPDATE SET
            title = EXCLUDED.title,
            message_text = EXCLUDED.message_text,
            download_url = EXCLUDED.download_url,
            button_text = EXCLUDED.button_text,
            timestamp = EXCLUDED.timestamp
          RETURNING *
        `;
        
        const result = await pool.query(query, [
          appId,
          messageWithId.id,
          messageWithId.title,
          messageWithId.message,
          messageWithId.downloadUrl || null,
          messageWithId.buttonText || 'OK',
          messageWithId.timestamp
        ]);

        console.log(`📬 Message ajouté en BDD pour ${appId}:`, message.title);
        console.log('🔍 Résultat insertion:', result.rows[0]);
        return messageWithId;
        
      } catch (error) {
        retries--;
        console.error(`❌ Erreur ajout message BDD (tentatives restantes: ${retries}):`, error.message);
        
        if (retries === 0) {
          throw new Error(`Impossible d'ajouter le message après 3 tentatives: ${error.message}`);
        }
        
        // Attendre avant de retenter
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  },

  // Récupérer les messages valides avec retry
  getValidMessages: async (appId) => {
    let retries = 3;
    while (retries > 0) {
      try {
        console.log(`🔍 Recherche messages pour ${appId} (tentative ${4-retries}/3)`);
        
        // Vérifier la connexion
        await pool.query('SELECT 1');
        
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
          id: row.id,
          title: row.title,
          message: row.message,
          downloadUrl: row.downloadurl,
          buttonText: row.buttontext,
          timestamp: row.timestamp
        }));

        console.log(`📱 App ${appId} a vérifié les messages BDD: ${messages.length} trouvés`);
        console.log('📋 Messages trouvés:', messages);
        return messages;
        
      } catch (error) {
        retries--;
        console.error(`❌ Erreur récupération messages (tentatives restantes: ${retries}):`, error.message);
        
        if (retries === 0) {
          console.error('❌ Impossible de récupérer les messages après 3 tentatives');
          return [];
        }
        
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
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

};

// Fonction pour initialiser la table (hors de l'export)
const initTable = async () => {
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
};

// Ajouter initTable à l'export
module.exports.initTable = initTable;