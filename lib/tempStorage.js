// Storage temporaire pour les URLs longues (contournement limite callback_data)

const tempStorage = new Map();

// Stocker une URL temporairement avec un ID court
function storeTemporaryUrl(url) {
  const id = Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  tempStorage.set(id, {
    url: url,
    timestamp: Date.now()
  });
  
  // Auto-cleanup après 10 minutes
  setTimeout(() => {
    tempStorage.delete(id);
  }, 10 * 60 * 1000);
  
  return id;
}

// Récupérer une URL stockée
function getStoredUrl(id) {
  const data = tempStorage.get(id);
  if (!data) return null;
  
  // Vérifier expiration (10 minutes)
  if (Date.now() - data.timestamp > 10 * 60 * 1000) {
    tempStorage.delete(id);
    return null;
  }
  
  return data.url;
}

// Nettoyer les données expirées
function cleanupExpired() {
  const now = Date.now();
  for (const [id, data] of tempStorage.entries()) {
    if (now - data.timestamp > 10 * 60 * 1000) {
      tempStorage.delete(id);
    }
  }
}

// Nettoyer toutes les 5 minutes
setInterval(cleanupExpired, 5 * 60 * 1000);

module.exports = {
  storeTemporaryUrl,
  getStoredUrl
};