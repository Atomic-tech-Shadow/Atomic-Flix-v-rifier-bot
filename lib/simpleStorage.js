// Système simple sans stockage persistent
// Pour Vercel - le message est traité immédiatement sans stockage

module.exports = {
  // Ajouter un message (traitement immédiat)
  addMessage: async (appId, message) => {
    const messageWithId = {
      id: Date.now().toString(),
      ...message,
      timestamp: new Date().toISOString()
    };
    
    console.log(`📬 Message traité immédiatement pour ${appId}:`, message.title);
    console.log('📝 Contenu:', messageWithId);
    
    // Retourner le message mais ne pas le stocker
    return messageWithId;
  },

  // Récupérer les messages (toujours vide car pas de stockage)
  getValidMessages: async (appId) => {
    console.log(`📱 App ${appId} - aucun message stocké (traitement immédiat)`);
    return [];
  },

  // Nettoyer (rien à faire)
  clearMessages: async (appId) => {
    console.log(`🧹 Aucun nettoyage nécessaire pour ${appId} (pas de stockage)`);
  },

  // Stats vides
  getAllStats: async () => {
    return {};
  }
};