# 📱 Intégration React Native - ATOMIC FLIX Backend

## Vue d'ensemble

Ce guide explique comment intégrer le backend Telegram ATOMIC FLIX dans votre application React Native pour vérifier les abonnements des utilisateurs.

## 🔧 Configuration

### 1. URL du Backend

```javascript
// config/api.js
const API_CONFIG = {
  BASE_URL: 'https://atomic-flix-verifier-bot.vercel.app',
  ENDPOINTS: {
    HEALTH: '/api/health',
    VERIFY_SUBSCRIPTION: '/api/verify-subscription',
    BOT_INFO: '/api/bot-info',
    SEND_MESSAGE: '/api/send-message'
  }
};

export default API_CONFIG;
```

### 2. Service API

```javascript
// services/TelegramService.js
import API_CONFIG from '../config/api';

class TelegramService {
  constructor() {
    this.baseUrl = API_CONFIG.BASE_URL;
  }

  async checkBackendHealth() {
    try {
      const response = await fetch(`${this.baseUrl}${API_CONFIG.ENDPOINTS.HEALTH}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Health check failed:', error);
      throw error;
    }
  }

  async verifySubscription(userId) {
    try {
      const response = await fetch(`${this.baseUrl}${API_CONFIG.ENDPOINTS.VERIFY_SUBSCRIPTION}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: userId.toString() })
      });
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Subscription verification failed:', error);
      throw error;
    }
  }

  async getBotInfo() {
    try {
      const response = await fetch(`${this.baseUrl}${API_CONFIG.ENDPOINTS.BOT_INFO}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Bot info failed:', error);
      throw error;
    }
  }

  async sendMessage(userId, message, useInlineKeyboard = false) {
    try {
      const response = await fetch(`${this.baseUrl}${API_CONFIG.ENDPOINTS.SEND_MESSAGE}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId.toString(),
          message,
          useInlineKeyboard
        })
      });
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Send message failed:', error);
      throw error;
    }
  }
}

export default new TelegramService();
```

## 🎯 Composants React Native

### 1. Hook personnalisé pour la vérification d'abonnement

```javascript
// hooks/useSubscriptionCheck.js
import { useState, useEffect } from 'react';
import TelegramService from '../services/TelegramService';

export const useSubscriptionCheck = (userId) => {
  const [isSubscribed, setIsSubscribed] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userInfo, setUserInfo] = useState(null);

  const checkSubscription = async () => {
    if (!userId) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await TelegramService.verifySubscription(userId);
      
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
  };

  useEffect(() => {
    checkSubscription();
  }, [userId]);

  return {
    isSubscribed,
    isLoading,
    error,
    userInfo,
    recheckSubscription: checkSubscription
  };
};
```

### 2. Composant de vérification d'abonnement

```javascript
// components/SubscriptionChecker.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Linking,
  ActivityIndicator
} from 'react-native';
import { useSubscriptionCheck } from '../hooks/useSubscriptionCheck';

const SubscriptionChecker = ({ userId, onSubscriptionVerified }) => {
  const { isSubscribed, isLoading, error, userInfo, recheckSubscription } = useSubscriptionCheck(userId);
  const [isRechecking, setIsRechecking] = useState(false);

  const handleJoinChannel = async () => {
    try {
      await Linking.openURL('https://t.me/Atomic_flix_officiel');
    } catch (err) {
      Alert.alert('Erreur', 'Impossible d\'ouvrir le canal Telegram');
    }
  };

  const handleRecheck = async () => {
    setIsRechecking(true);
    await recheckSubscription();
    setIsRechecking(false);
    
    if (isSubscribed) {
      onSubscriptionVerified && onSubscriptionVerified(userInfo);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Vérification en cours...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>❌ Erreur de vérification</Text>
        <Text style={styles.errorDetail}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleRecheck}>
          <Text style={styles.retryButtonText}>Réessayer</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (isSubscribed) {
    return (
      <View style={styles.container}>
        <Text style={styles.successText}>✅ Abonnement vérifié !</Text>
        <Text style={styles.successDetail}>
          Vous avez accès à tous les contenus ATOMIC FLIX
        </Text>
        {userInfo && (
          <Text style={styles.userInfo}>
            Statut: {userInfo.status === 'creator' ? 'Créateur' : 'Membre'}
          </Text>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.warningText}>🔒 Abonnement requis</Text>
      <Text style={styles.warningDetail}>
        Rejoignez le canal @Atomic_flix_officiel pour accéder aux contenus
      </Text>
      
      <TouchableOpacity style={styles.joinButton} onPress={handleJoinChannel}>
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#F8F9FA',
    borderRadius: 10,
    margin: 10,
    alignItems: 'center'
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666'
  },
  successText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#28A745',
    marginBottom: 10
  },
  successDetail: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center'
  },
  userInfo: {
    fontSize: 12,
    color: '#999',
    marginTop: 5
  },
  warningText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFC107',
    marginBottom: 10
  },
  warningDetail: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20
  },
  joinButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    marginBottom: 10
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
    borderRadius: 20
  },
  recheckButtonText: {
    color: '#FFFFFF',
    fontSize: 14
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#DC3545',
    marginBottom: 10
  },
  errorDetail: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20
  },
  retryButton: {
    backgroundColor: '#DC3545',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 20
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14
  }
});

export default SubscriptionChecker;
```

### 3. Écran principal avec vérification d'abonnement

```javascript
// screens/MainScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SubscriptionChecker from '../components/SubscriptionChecker';
import TelegramService from '../services/TelegramService';

const MainScreen = () => {
  const [userId, setUserId] = useState(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [backendHealth, setBackendHealth] = useState(null);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Récupérer l'ID utilisateur depuis le stockage local
      const storedUserId = await AsyncStorage.getItem('telegram_user_id');
      if (storedUserId) {
        setUserId(storedUserId);
      } else {
        // Demander à l'utilisateur de saisir son ID
        promptForUserId();
      }

      // Vérifier la santé du backend
      const health = await TelegramService.checkBackendHealth();
      setBackendHealth(health);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de se connecter au backend');
    }
  };

  const promptForUserId = () => {
    Alert.prompt(
      'Configuration',
      'Entrez votre ID utilisateur Telegram pour continuer:',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'OK', onPress: handleUserIdSubmit }
      ],
      'plain-text'
    );
  };

  const handleUserIdSubmit = async (inputUserId) => {
    if (inputUserId && inputUserId.trim()) {
      await AsyncStorage.setItem('telegram_user_id', inputUserId.trim());
      setUserId(inputUserId.trim());
    }
  };

  const handleSubscriptionVerified = (userInfo) => {
    setIsSubscribed(true);
    Alert.alert('Succès', 'Abonnement vérifié ! Vous avez accès aux contenus.');
  };

  const renderContent = () => {
    if (!isSubscribed) {
      return (
        <View style={styles.contentContainer}>
          <Text style={styles.title}>🎬 ATOMIC FLIX</Text>
          <Text style={styles.subtitle}>Accès aux contenus premium</Text>
          
          <SubscriptionChecker
            userId={userId}
            onSubscriptionVerified={handleSubscriptionVerified}
          />
        </View>
      );
    }

    return (
      <View style={styles.contentContainer}>
        <Text style={styles.title}>🎬 ATOMIC FLIX</Text>
        <Text style={styles.subtitle}>Contenus disponibles</Text>
        
        <View style={styles.contentGrid}>
          <TouchableOpacity style={styles.contentCard}>
            <Text style={styles.cardTitle}>🎥 Films</Text>
            <Text style={styles.cardDescription}>Accès aux derniers films</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.contentCard}>
            <Text style={styles.cardTitle}>📺 Séries</Text>
            <Text style={styles.cardDescription}>Épisodes exclusifs</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.contentCard}>
            <Text style={styles.cardTitle}>🎭 Spectacles</Text>
            <Text style={styles.cardDescription}>Contenu premium</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      {renderContent()}
      
      {backendHealth && (
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Backend: {backendHealth.success ? '✅ Actif' : '❌ Inactif'}
          </Text>
          <Text style={styles.footerText}>
            Bot: @{backendHealth.bot?.username || 'Non disponible'}
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF'
  },
  contentContainer: {
    padding: 20
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
  contentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 20
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
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333'
  },
  cardDescription: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center'
  },
  footer: {
    padding: 20,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    marginTop: 30
  },
  footerText: {
    fontSize: 12,
    color: '#999',
    marginBottom: 2
  }
});

export default MainScreen;
```

## 🚀 Utilisation

### 1. Configuration initiale

```javascript
// App.js
import React from 'react';
import MainScreen from './screens/MainScreen';

const App = () => {
  return <MainScreen />;
};

export default App;
```

### 2. Gestion des erreurs

```javascript
// utils/ErrorHandler.js
export const handleApiError = (error, context) => {
  console.error(`${context} Error:`, error);
  
  if (error.message.includes('Network')) {
    return 'Problème de connexion réseau';
  }
  
  if (error.message.includes('user_not_found')) {
    return 'Utilisateur non trouvé sur Telegram';
  }
  
  if (error.message.includes('unauthorized')) {
    return 'Bot non autorisé à accéder au canal';
  }
  
  return 'Erreur inattendue. Veuillez réessayer.';
};
```

## 🔧 Fonctionnalités avancées

### 1. Notification push après abonnement

```javascript
// services/NotificationService.js
import TelegramService from './TelegramService';

export const sendWelcomeMessage = async (userId) => {
  try {
    const message = `🎬 Bienvenue sur ATOMIC FLIX !\n\nVous avez maintenant accès à tous nos contenus premium. Profitez de l'expérience !`;
    
    await TelegramService.sendMessage(userId, message, true);
  } catch (error) {
    console.error('Failed to send welcome message:', error);
  }
};
```

### 2. Vérification périodique

```javascript
// hooks/usePeriodicCheck.js
import { useEffect } from 'react';
import { useSubscriptionCheck } from './useSubscriptionCheck';

export const usePeriodicSubscriptionCheck = (userId, intervalMinutes = 30) => {
  const { recheckSubscription } = useSubscriptionCheck(userId);

  useEffect(() => {
    const interval = setInterval(() => {
      recheckSubscription();
    }, intervalMinutes * 60 * 1000);

    return () => clearInterval(interval);
  }, [userId, intervalMinutes]);
};
```

## 🎯 Résumé

Cette intégration permet à votre application React Native de :

1. **Vérifier automatiquement** l'abonnement Telegram des utilisateurs
2. **Bloquer l'accès** aux contenus pour les non-abonnés
3. **Envoyer des notifications** via Telegram
4. **Gérer les erreurs** de manière élégante
5. **Offrir une expérience utilisateur fluide** avec des boutons interactifs

Le backend est entièrement configuré et prêt à être utilisé avec ces composants React Native.