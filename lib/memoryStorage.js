// Stockage en mémoire simple pour Vercel serverless
// Les messages sont stockés temporairement et partagés entre les fonctions

// Stockage global en mémoire
global.messageStore = global.messageStore || {};

module.exports = {
  // Ajouter un message
  addMessage: (appId, message) => {
    if (!global.messageStore[appId]) {
      global.messageStore[appId] = [];
    }
    
    const messageWithId = {
      id: Date.now().toString(),
      ...message,
      timestamp: new Date().toISOString()
    };
    
    global.messageStore[appId].push(messageWithId);
    console.log(`📬 Message ajouté en mémoire pour ${appId}:`, message.title);
    console.log('Store actuel:', global.messageStore);
    return messageWithId;
  },

  // Récupérer les messages valides (dernières 24h)
  getValidMessages: (appId) => {
    if (!global.messageStore[appId]) {
      return [];
    }
    
    const messages = global.messageStore[appId];
    
    // Filtrer les messages non expirés (dernières 24h)
    const validMessages = messages.filter(msg => {
      const messageTime = new Date(msg.timestamp);
      const now = new Date();
      return (now - messageTime) < 24 * 60 * 60 * 1000; // 24h
    });
    
    console.log(`📱 App ${appId} a vérifié les messages: ${validMessages.length} trouvés`);
    return validMessages;
  },

  // Nettoyer les messages après lecture
  clearMessages: (appId) => {
    if (global.messageStore[appId]) {
      const count = global.messageStore[appId].length;
      delete global.messageStore[appId];
      console.log(`🧹 ${count} messages nettoyés en mémoire pour ${appId}`);
    }
  },

  // Obtenir toutes les stats de messages
  getAllStats: () => {
    const stats = {};
    
    Object.keys(global.messageStore || {}).forEach(appId => {
      const messages = global.messageStore[appId] || [];
      const validMessages = messages.filter(msg => {
        const messageTime = new Date(msg.timestamp);
        const now = new Date();
        return (now - messageTime) < 24 * 60 * 60 * 1000; // 24h
      });
      
      stats[appId] = {
        total: messages.length,
        valid: validMessages.length
      };
    });
    
    return stats;
  }
};