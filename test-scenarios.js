// Script pour tester différents scénarios d'abonnement
// Utilise des IDs réels mais simule différents états

const TEST_SCENARIOS = {
  // Scénario 1: Utilisateur abonné normal
  subscriber: {
    userId: '6968736907', // Votre ID réel
    expectedResult: {
      isSubscribed: true,
      status: 'creator'
    }
  },
  
  // Scénario 2: Utilisateur inexistant
  nonExistentUser: {
    userId: '999999999',
    expectedResult: {
      isSubscribed: false,
      error: 'user_not_found'
    }
  },
  
  // Scénario 3: Test avec ID invalide
  invalidId: {
    userId: 'invalid_id',
    expectedResult: {
      error: 'Invalid user ID format'
    }
  }
};

async function testSubscriptionScenarios() {
  const baseUrl = 'http://localhost:5000';
  
  console.log('🧪 Tests de vérification d\'abonnement\n');
  
  for (const [scenarioName, scenario] of Object.entries(TEST_SCENARIOS)) {
    console.log(`📋 Test: ${scenarioName}`);
    console.log(`👤 User ID: ${scenario.userId}`);
    
    try {
      const response = await fetch(`${baseUrl}/api/verify-subscription`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: scenario.userId
        })
      });
      
      const result = await response.json();
      
      console.log('✅ Résultat:', {
        success: result.success,
        isSubscribed: result.isSubscribed,
        status: result.status,
        error: result.error
      });
      
      console.log('-------------------\n');
      
    } catch (error) {
      console.log('❌ Erreur:', error.message);
      console.log('-------------------\n');
    }
  }
}

// Exécuter les tests
if (require.main === module) {
  testSubscriptionScenarios();
}

module.exports = { TEST_SCENARIOS, testSubscriptionScenarios };