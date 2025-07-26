// Stockage en mémoire partagé pour les messages
let messages = {};

module.exports = {
  // Ajouter un message
  addMessage: (appId, message) => {
    if (!messages[appId]) {
      messages[appId] = [];
    }
    
    const messageWithId = {
      id: Date.now().toString(),
      ...message,
      timestamp: new Date().toISOString()
    };
    
    messages[appId].push(messageWithId);
    console.log(`📬 Message ajouté pour ${appId}:`, message.title);
    return messageWithId;
  },

  // Récupérer les messages valides (dernières 24h)
  getValidMessages: (appId) => {
    const appMessages = messages[appId] || [];
    
    // Filtrer les messages non expirés (dernières 24h)
    const validMessages = appMessages.filter(msg => {
      const messageTime = new Date(msg.timestamp);
      const now = new Date();
      return (now - messageTime) < 24 * 60 * 60 * 1000; // 24h
    });
    
    return validMessages;
  },

  // Nettoyer les messages après lecture
  clearMessages: (appId) => {
    if (messages[appId]) {
      const count = messages[appId].length;
      messages[appId] = [];
      console.log(`🧹 ${count} messages nettoyés pour ${appId}`);
    }
  },

  // Obtenir toutes les stats de messages
  getAllStats: () => {
    const stats = {};
    for (const appId in messages) {
      stats[appId] = {
        total: messages[appId].length,
        valid: exports.getValidMessages(appId).length
      };
    }
    return stats;
  }
};