const fs = require('fs');
const path = require('path');

// Stockage basé sur fichiers pour persistance entre les appels serverless
const STORAGE_DIR = '/tmp/messages';
const ensureStorageDir = () => {
  if (!fs.existsSync(STORAGE_DIR)) {
    fs.mkdirSync(STORAGE_DIR, { recursive: true });
  }
};

const getStorageFile = (appId) => path.join(STORAGE_DIR, `${appId}.json`);

const readMessages = (appId) => {
  try {
    ensureStorageDir();
    const filePath = getStorageFile(appId);
    if (!fs.existsSync(filePath)) {
      return [];
    }
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Erreur lecture messages pour ${appId}:`, error);
    return [];
  }
};

const writeMessages = (appId, messages) => {
  try {
    ensureStorageDir();
    const filePath = getStorageFile(appId);
    fs.writeFileSync(filePath, JSON.stringify(messages, null, 2));
  } catch (error) {
    console.error(`Erreur écriture messages pour ${appId}:`, error);
  }
};

module.exports = {
  // Ajouter un message
  addMessage: (appId, message) => {
    const messages = readMessages(appId);
    
    const messageWithId = {
      id: Date.now().toString(),
      ...message,
      timestamp: new Date().toISOString()
    };
    
    messages.push(messageWithId);
    writeMessages(appId, messages);
    console.log(`📬 Message ajouté pour ${appId}:`, message.title);
    return messageWithId;
  },

  // Récupérer les messages valides (dernières 24h)
  getValidMessages: (appId) => {
    const messages = readMessages(appId);
    
    // Filtrer les messages non expirés (dernières 24h)
    const validMessages = messages.filter(msg => {
      const messageTime = new Date(msg.timestamp);
      const now = new Date();
      return (now - messageTime) < 24 * 60 * 60 * 1000; // 24h
    });
    
    return validMessages;
  },

  // Nettoyer les messages après lecture
  clearMessages: (appId) => {
    try {
      const filePath = getStorageFile(appId);
      if (fs.existsSync(filePath)) {
        const messages = readMessages(appId);
        const count = messages.length;
        fs.unlinkSync(filePath);
        console.log(`🧹 ${count} messages nettoyés pour ${appId}`);
      }
    } catch (error) {
      console.error(`Erreur nettoyage messages pour ${appId}:`, error);
    }
  },

  // Obtenir toutes les stats de messages
  getAllStats: () => {
    try {
      ensureStorageDir();
      const files = fs.readdirSync(STORAGE_DIR);
      const stats = {};
      
      files.forEach(file => {
        if (file.endsWith('.json')) {
          const appId = file.replace('.json', '');
          const messages = readMessages(appId);
          const validMessages = messages.filter(msg => {
            const messageTime = new Date(msg.timestamp);
            const now = new Date();
            return (now - messageTime) < 24 * 60 * 60 * 1000; // 24h
          });
          
          stats[appId] = {
            total: messages.length,
            valid: validMessages.length
          };
        }
      });
      
      return stats;
    } catch (error) {
      console.error('Erreur obtention stats:', error);
      return {};
    }
  }
};