// Système hybride: PostgreSQL si disponible, sinon mémoire
const memoryStorage = require('./memoryStorage');

let postgresStorage = null;
let usePostgres = false;

// Essayer d'initialiser PostgreSQL
try {
  if (process.env.DATABASE_URL) {
    postgresStorage = require('./postgresStorage');
    usePostgres = true;
    console.log('🗄️ Utilisation de PostgreSQL pour le stockage');
  }
} catch (error) {
  console.log('⚠️ PostgreSQL non disponible, utilisation mémoire:', error.message);
  usePostgres = false;
}

module.exports = {
  // Ajouter un message
  addMessage: async (appId, message) => {
    if (usePostgres && postgresStorage) {
      try {
        return await postgresStorage.addMessage(appId, message);
      } catch (error) {
        console.error('Erreur PostgreSQL, basculement mémoire:', error);
        usePostgres = false;
        return memoryStorage.addMessage(appId, message);
      }
    } else {
      return memoryStorage.addMessage(appId, message);
    }
  },

  // Récupérer les messages valides
  getValidMessages: async (appId) => {
    if (usePostgres && postgresStorage) {
      try {
        return await postgresStorage.getValidMessages(appId);
      } catch (error) {
        console.error('Erreur PostgreSQL, basculement mémoire:', error);
        usePostgres = false;
        return memoryStorage.getValidMessages(appId);
      }
    } else {
      return memoryStorage.getValidMessages(appId);
    }
  },

  // Nettoyer les messages
  clearMessages: async (appId) => {
    if (usePostgres && postgresStorage) {
      try {
        return await postgresStorage.clearMessages(appId);
      } catch (error) {
        console.error('Erreur PostgreSQL, basculement mémoire:', error);
        usePostgres = false;
        return memoryStorage.clearMessages(appId);
      }
    } else {
      return memoryStorage.clearMessages(appId);
    }
  },

  // Obtenir les stats
  getAllStats: async () => {
    if (usePostgres && postgresStorage) {
      try {
        return await postgresStorage.getAllStats();
      } catch (error) {
        console.error('Erreur PostgreSQL, basculement mémoire:', error);
        usePostgres = false;
        return memoryStorage.getAllStats();
      }
    } else {
      return memoryStorage.getAllStats();
    }
  }
};