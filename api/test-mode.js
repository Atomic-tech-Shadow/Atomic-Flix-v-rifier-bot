// Mode test pour simuler différents scénarios d'abonnement
// ⚠️ À utiliser uniquement en développement

const TEST_USERS = {
  // Utilisateurs abonnés (créateur du canal)
  '6968736907': { 
    isSubscribed: true, 
    status: 'creator',
    user: {
      id: 6968736907,
      username: 'Ghost_Cid',
      first_name: 'Ghost',
      is_bot: false
    }
  },
  
  // Utilisateurs membres normaux
  '123456789': {
    isSubscribed: true,
    status: 'member',
    user: {
      id: 123456789,
      username: 'test_user',
      first_name: 'Test',
      is_bot: false
    }
  },
  
  // Utilisateurs non abonnés
  '987654321': {
    isSubscribed: false,
    status: 'left',
    user: {
      id: 987654321,
      username: 'non_subscriber',
      first_name: 'Non',
      is_bot: false
    }
  },
  
  // Utilisateurs bannis
  '555666777': {
    isSubscribed: false,
    status: 'kicked',
    user: {
      id: 555666777,
      username: 'banned_user',
      first_name: 'Banned',
      is_bot: false
    }
  }
};

export default async function handler(req, res) {
  // Activer uniquement en mode développement
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({
      success: false,
      error: 'Test mode disabled in production'
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({
      success: false,
      error: 'User ID is required'
    });
  }

  const testUser = TEST_USERS[userId.toString()];

  if (!testUser) {
    return res.status(404).json({
      success: false,
      error: 'User not found in test database',
      isSubscribed: false,
      availableTestUsers: Object.keys(TEST_USERS)
    });
  }

  res.json({
    success: true,
    isSubscribed: testUser.isSubscribed,
    status: testUser.status,
    userInfo: testUser.user,
    channel: {
      id: '@Atomic_flix_officiel'
    },
    note: '⚠️ This is test mode data - not real subscription verification'
  });
}