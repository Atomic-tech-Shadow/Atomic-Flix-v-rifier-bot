# 🧪 Création d'un canal de test Telegram

## Pourquoi créer un canal de test ?

1. **Sécurité** : Éviter de compromettre votre canal principal
2. **Flexibilité** : Tester différents scénarios sans affecter les vrais abonnés
3. **Conformité** : Respecter les conditions d'utilisation de Telegram

## 📋 Étapes pour créer un canal de test

### 1. Créer un nouveau canal Telegram

1. Ouvrez Telegram
2. Créez un nouveau canal (ex: @Atomic_flix_test)
3. Rendez-le privé ou public selon vos besoins
4. Ajoutez votre bot comme administrateur

### 2. Configurer le bot pour le canal de test

```javascript
// Modifier temporairement lib/telegramBot.js
const CHANNEL_ID = process.env.NODE_ENV === 'production' 
  ? '@Atomic_flix_officiel'  // Canal principal
  : '@Atomic_flix_test';     // Canal de test

// Ou utiliser une variable d'environnement
const CHANNEL_ID = process.env.TEST_CHANNEL_ID || '@Atomic_flix_officiel';
```

### 3. Inviter des comptes de test

- Créez 2-3 comptes Telegram légitimes
- Invitez-les dans votre canal de test
- Utilisez leurs IDs réels pour tester

### 4. Tester différents scénarios

```javascript
// Scénarios de test avec vrais comptes
const TEST_ACCOUNTS = {
  subscribed: '6968736907',    // Votre compte (abonné)
  member: 'ID_AMI_1',         // Compte d'un ami (membre)
  nonSubscribed: 'ID_AMI_2'   // Compte qui n'est pas abonné
};
```

## 🔧 Script de test automatisé

```javascript
// test-with-real-accounts.js
async function testRealAccounts() {
  const accounts = [
    { id: '6968736907', description: 'Créateur du canal' },
    { id: 'AUTRE_ID_REEL', description: 'Membre normal' },
    { id: 'ID_NON_ABONNE', description: 'Non abonné' }
  ];

  for (const account of accounts) {
    console.log(`\n🧪 Test avec ${account.description}`);
    
    const response = await fetch('http://localhost:5000/api/verify-subscription', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: account.id })
    });
    
    const result = await response.json();
    console.log('Résultat:', result);
  }
}
```

## ✅ Bonnes pratiques

1. **Utilisez des comptes réels** : Même pour les tests
2. **Créez un environnement de test** : Canal séparé du principal
3. **Documentez les tests** : Gardez une trace des résultats
4. **Respectez les limites** : Pas plus de 20 requêtes/minute
5. **Nettoyez après** : Supprimez les données de test

## 🚫 À éviter absolument

- Générer de faux comptes Telegram
- Utiliser des bots pour simuler des abonnés
- Contourner les limitations de l'API Telegram
- Spammer les API avec des requêtes automatisées

Le système que nous avons créé fonctionne parfaitement avec de vrais utilisateurs et respecte toutes les règles de Telegram.