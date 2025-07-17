# 📱 Guide d'intégration React Native - Vérification d'abonnement Telegram

## 🎯 Objectif

Intégrer la vérification d'abonnement Telegram dans votre application React Native pour contrôler l'accès aux contenus ATOMIC FLIX.

## 📋 Prérequis

1. Application React Native fonctionnelle
2. Backend ATOMIC FLIX déployé sur Vercel
3. Packages npm nécessaires :
   ```bash
   npm install @react-native-async-storage/async-storage
   ```

## 🔧 Configuration initiale

### 1. Configuration de l'API

Créez un fichier `src/config/api.js` :

```javascript
const API_CONFIG = {
  // Remplacez par l'URL de votre backend déployé
  BASE_URL: 'https://votre-backend-atomic-flix.vercel.app',
  
  ENDPOINTS: {
    HEALTH: '/api/health',
    VERIFY_SUBSCRIPTION: '/api/verify-subscription',
    BOT_INFO: '/api/bot-info'
  },
  
  TELEGRAM: {
    CHANNEL_URL: 'https://t.me/Atomic_flix_officiel',
    CHANNEL_NAME: '@Atomic_flix_officiel'
  }
};

export default API_CONFIG;
```

### 2. Service de vérification

Créez `src/services/SubscriptionService.js` :

```javascript
import API_CONFIG from '../config/api';

class SubscriptionService {
  
  // Vérifier l'abonnement d'un utilisateur
  async verifySubscription(userId) {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.VERIFY_SUBSCRIPTION}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          userId: userId.toString() 
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Erreur de vérification');
      }
      
      return {
        success: data.success,
        isSubscribed: data.isSubscribed,
        status: data.status,
        userInfo: data.userInfo,
        error: data.error
      };
      
    } catch (error) {
      console.error('Erreur vérification abonnement:', error);
      return {
        success: false,
        isSubscribed: false,
        error: error.message
      };
    }
  }
  
  // Vérifier la santé du backend
  async checkBackendHealth() {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.HEALTH}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erreur health check:', error);
      return { success: false, error: error.message };
    }
  }
}

export default new SubscriptionService();
```

## 🎨 Composants UI

### 1. Hook de vérification d'abonnement

Créez `src/hooks/useSubscription.js` :

```javascript
import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SubscriptionService from '../services/SubscriptionService';

export const useSubscription = () => {
  const [userId, setUserId] = useState(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userInfo, setUserInfo] = useState(null);

  // Charger l'ID utilisateur depuis le stockage
  useEffect(() => {
    loadUserId();
  }, []);

  const loadUserId = async () => {
    try {
      const storedUserId = await AsyncStorage.getItem('telegram_user_id');
      if (storedUserId) {
        setUserId(storedUserId);
      }
    } catch (error) {
      console.error('Erreur chargement user ID:', error);
    }
  };

  // Sauvegarder l'ID utilisateur
  const saveUserId = async (newUserId) => {
    try {
      await AsyncStorage.setItem('telegram_user_id', newUserId.toString());
      setUserId(newUserId.toString());
    } catch (error) {
      console.error('Erreur sauvegarde user ID:', error);
    }
  };

  // Vérifier l'abonnement
  const checkSubscription = useCallback(async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await SubscriptionService.verifySubscription(userId);
      
      if (result.success) {
        setIsSubscribed(result.isSubscribed);
        setUserInfo(result.userInfo);
      } else {
        setError(result.error);
        setIsSubscribed(false);
      }
    } catch (err) {
      setError(err.message);
      setIsSubscribed(false);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Vérifier automatiquement quand userId change
  useEffect(() => {
    if (userId) {
      checkSubscription();
    }
  }, [userId, checkSubscription]);

  return {
    userId,
    isSubscribed,
    isLoading,
    error,
    userInfo,
    saveUserId,
    checkSubscription
  };
};
```

### 2. Composant de vérification

Créez `src/components/SubscriptionGate.js` :

```javascript
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Linking,
  ActivityIndicator,
  TextInput
} from 'react-native';
import { useSubscription } from '../hooks/useSubscription';
import API_CONFIG from '../config/api';

const SubscriptionGate = ({ children }) => {
  const {
    userId,
    isSubscribed,
    isLoading,
    error,
    userInfo,
    saveUserId,
    checkSubscription
  } = useSubscription();

  const [inputUserId, setInputUserId] = React.useState('');
  const [isRechecking, setIsRechecking] = React.useState(false);

  // Ouvrir le canal Telegram
  const openTelegramChannel = async () => {
    try {
      const supported = await Linking.canOpenURL(API_CONFIG.TELEGRAM.CHANNEL_URL);
      if (supported) {
        await Linking.openURL(API_CONFIG.TELEGRAM.CHANNEL_URL);
      } else {
        Alert.alert(
          'Erreur',
          'Impossible d\'ouvrir Telegram. Assurez-vous que l\'application est installée.'
        );
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible d\'ouvrir le canal Telegram');
    }
  };

  // Enregistrer l'ID utilisateur
  const handleSaveUserId = () => {
    if (inputUserId.trim()) {
      saveUserId(inputUserId.trim());
      setInputUserId('');
    } else {
      Alert.alert('Erreur', 'Veuillez entrer un ID utilisateur valide');
    }
  };

  // Revérifier l'abonnement
  const handleRecheck = async () => {
    setIsRechecking(true);
    await checkSubscription();
    setIsRechecking(false);
  };

  // Obtenir l'ID utilisateur depuis @userinfobot
  const showUserIdHelp = () => {
    Alert.alert(
      'Comment obtenir votre ID Telegram ?',
      '1. Ouvrez Telegram\n2. Recherchez @userinfobot\n3. Envoyez-lui un message\n4. Il vous donnera votre ID utilisateur\n5. Copiez ce nombre ici',
      [
        { text: 'Ouvrir @userinfobot', onPress: () => Linking.openURL('https://t.me/userinfobot') },
        { text: 'Compris', style: 'cancel' }
      ]
    );
  };

  // Pas d'ID utilisateur configuré
  if (!userId) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>🎬 ATOMIC FLIX</Text>
        <Text style={styles.subtitle}>Configuration requise</Text>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>ID Utilisateur Telegram</Text>
          <TextInput
            style={styles.input}
            value={inputUserId}
            onChangeText={setInputUserId}
            placeholder="Entrez votre ID Telegram"
            keyboardType="numeric"
          />
          <TouchableOpacity style={styles.helpButton} onPress={showUserIdHelp}>
            <Text style={styles.helpButtonText}>❓ Comment obtenir mon ID ?</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.primaryButton} onPress={handleSaveUserId}>
          <Text style={styles.primaryButtonText}>Continuer</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Chargement en cours
  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Vérification de votre abonnement...</Text>
      </View>
    );
  }

  // Erreur de vérification
  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorTitle}>❌ Erreur de vérification</Text>
        <Text style={styles.errorText}>{error}</Text>
        
        <TouchableOpacity style={styles.retryButton} onPress={handleRecheck}>
          <Text style={styles.retryButtonText}>Réessayer</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.changeIdButton} onPress={() => saveUserId('')}>
          <Text style={styles.changeIdButtonText}>Changer d'ID utilisateur</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Utilisateur non abonné
  if (!isSubscribed) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>🎬 ATOMIC FLIX</Text>
        <Text style={styles.warningTitle}>🔒 Abonnement requis</Text>
        <Text style={styles.warningText}>
          Vous devez être abonné au canal {API_CONFIG.TELEGRAM.CHANNEL_NAME} pour accéder aux contenus.
        </Text>

        <TouchableOpacity style={styles.joinButton} onPress={openTelegramChannel}>
          <Text style={styles.joinButtonText}>📱 Rejoindre le canal</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.recheckButton} 
          onPress={handleRecheck}
          disabled={isRechecking}
        >
          {isRechecking ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.recheckButtonText}>🔄 Vérifier à nouveau</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.changeIdButton} onPress={() => saveUserId('')}>
          <Text style={styles.changeIdButtonText}>Changer d'ID utilisateur</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Utilisateur abonné - afficher le contenu
  return (
    <View style={styles.fullContainer}>
      <View style={styles.successHeader}>
        <Text style={styles.successText}>✅ Accès autorisé</Text>
        <Text style={styles.successDetail}>
          Statut: {userInfo?.status === 'creator' ? 'Créateur' : 'Membre'}
        </Text>
      </View>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center'
  },
  fullContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF'
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#333'
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    color: '#666'
  },
  inputContainer: {
    width: '100%',
    marginBottom: 30
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333'
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#F9F9F9'
  },
  helpButton: {
    marginTop: 10,
    padding: 8
  },
  helpButtonText: {
    color: '#007AFF',
    fontSize: 14,
    textAlign: 'center'
  },
  primaryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
    marginBottom: 20
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold'
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#666'
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#DC3545',
    marginBottom: 10
  },
  errorText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20
  },
  warningTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFC107',
    marginBottom: 10
  },
  warningText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 20
  },
  joinButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    marginBottom: 15
  },
  joinButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold'
  },
  recheckButton: {
    backgroundColor: '#6C757D',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 20,
    marginBottom: 10
  },
  recheckButtonText: {
    color: '#FFFFFF',
    fontSize: 14
  },
  retryButton: {
    backgroundColor: '#DC3545',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 20,
    marginBottom: 10
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14
  },
  changeIdButton: {
    paddingVertical: 10
  },
  changeIdButtonText: {
    color: '#007AFF',
    fontSize: 12,
    textDecorationLine: 'underline'
  },
  successHeader: {
    backgroundColor: '#E8F5E8',
    padding: 15,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#DDD'
  },
  successText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#28A745'
  },
  successDetail: {
    fontSize: 12,
    color: '#666',
    marginTop: 5
  }
});

export default SubscriptionGate;
```

## 🚀 Utilisation dans votre application

### 1. Intégration dans App.js

```javascript
// App.js
import React from 'react';
import { SafeAreaView } from 'react-native';
import SubscriptionGate from './src/components/SubscriptionGate';
import MainContent from './src/components/MainContent';

const App = () => {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <SubscriptionGate>
        <MainContent />
      </SubscriptionGate>
    </SafeAreaView>
  );
};

export default App;
```

### 2. Votre contenu principal

```javascript
// src/components/MainContent.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity
} from 'react-native';

const MainContent = () => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🎬 ATOMIC FLIX</Text>
        <Text style={styles.subtitle}>Contenus premium disponibles</Text>
      </View>

      <View style={styles.contentGrid}>
        <TouchableOpacity style={styles.contentCard}>
          <Text style={styles.cardTitle}>🎥 Films</Text>
          <Text style={styles.cardDescription}>Derniers films en streaming</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.contentCard}>
          <Text style={styles.cardTitle}>📺 Séries</Text>
          <Text style={styles.cardDescription}>Épisodes exclusifs</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.contentCard}>
          <Text style={styles.cardTitle}>🎭 Spectacles</Text>
          <Text style={styles.cardDescription}>Contenu live premium</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.contentCard}>
          <Text style={styles.cardTitle}>🎮 Gaming</Text>
          <Text style={styles.cardDescription}>Streams gaming exclusifs</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF'
  },
  header: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#F8F9FA'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5
  },
  subtitle: {
    fontSize: 14,
    color: '#666'
  },
  contentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 20,
    justifyContent: 'space-between'
  },
  contentCard: {
    width: '48%',
    backgroundColor: '#F8F9FA',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    alignItems: 'center'
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333'
  },
  cardDescription: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center'
  }
});

export default MainContent;
```

## 🔧 Configuration finale

### 1. Permissions dans package.json

Ajoutez ces dépendances :

```json
{
  "dependencies": {
    "@react-native-async-storage/async-storage": "^1.19.0"
  }
}
```

### 2. Configuration Android (android/app/src/main/AndroidManifest.xml)

```xml
<uses-permission android:name="android.permission.INTERNET" />
```

### 3. Configuration iOS (ios/YourApp/Info.plist)

```xml
<key>NSAppTransportSecurity</key>
<dict>
  <key>NSAllowsArbitraryLoads</key>
  <true/>
</dict>
```

## 🎯 Résumé du fonctionnement

1. **Configuration initiale** : L'utilisateur entre son ID Telegram
2. **Vérification** : L'app vérifie l'abonnement via votre backend
3. **Accès conditionnel** : 
   - Si abonné → Accès au contenu
   - Si non abonné → Redirection vers le canal Telegram
4. **Revérification** : L'utilisateur peut vérifier à nouveau après s'être abonné

## 🚀 Déployement

1. Configurez l'URL de votre backend dans `api.js`
2. Compilez votre application React Native
3. Testez avec un utilisateur abonné et non abonné
4. Déployez sur les stores

Votre application contrôlera automatiquement l'accès basé sur l'abonnement Telegram !