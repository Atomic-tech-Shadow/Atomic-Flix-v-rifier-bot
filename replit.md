# ATOMIC FLIX Telegram Bot API

## Overview

This is a Telegram bot backend API for ATOMIC FLIX, an anime streaming platform. The system is built as a serverless application designed to run on Vercel, providing subscription verification, user engagement features, and promotional content for an anime streaming service.

## User Preferences

Preferred communication style: Simple, everyday language.
Language: French (user communicates in French)

## Recent Changes

✅ MIGRATION REPLIT AGENT → REPLIT COMPLETED (26/07/2025)
- Successfully migrated project from Replit Agent to Replit environment
- Installed all required Node.js dependencies (express, axios, canvas, node-telegram-bot-api, pg)
- Fixed server.js routing for check-messages endpoint with dynamic appId parameter
- Verified API functionality: send-app-message and check-messages working perfectly
- Message storage system operational with file-based persistence in /tmp/messages/
- Telegram bot backend running successfully on port 5000
- All critical endpoints tested and confirmed functional
- Project ready for development and deployment

✅ SYSTÈME SIMPLIFIÉ - SUPPRESSION NOTIFICATIONS PUSH (26/07/2025)
- Supprimé tous les fichiers liés aux notifications push (database.js, storage-fallback.js, tempStorage.js)
- Nettoyé les références aux tokens Expo dans server.js et webhook.js
- Supprimé la table PostgreSQL expo_push_tokens (plus nécessaire)
- Corrigé les erreurs de syntaxe dans webhook.js après nettoyage
- Implémenté PostgreSQL robuste avec retry automatique et logging détaillé
- Corrigé erreur initTable et testé avec succès - messages persistent correctement
- Système de stockage fonctionnel garantissant la réception des messages par les apps
- Table app_messages créée automatiquement avec système de retry pour Vercel
- Architecture simplifiée et plus maintenable sans dépendances push

✅ DEMO MODE CLEANUP COMPLETED (25/07/2025)
- Removed all demo configurations from push notifications
- Deleted simulated users and demo tokens from register-push-token.js
- Removed simulation logic from update-command.js
- Deleted CONFIG-APP-MINIMALE.md demo documentation
- System now requires real Expo tokens for notifications
- Clean production-ready notification system

✅ COMMANDS CLEANUP COMPLETED (25/07/2025)  
- Removed /anime and /channel commands as requested
- Removed /about, /support, /premium, and /status commands
- Deleted api/anime-promotion.js, api/growth-features.js, api/channel-events.js files
- Cleaned up all references in vercel.json, server.js, and documentation
- Updated bot command list to only include: /start, /verify, /help, /update
- Bot commands successfully updated in Telegram
- Server routes and webhook handlers fully cleaned

✅ SECURITY INCIDENT RESOLVED (25/07/2025)
- Identified and removed malicious webhook (botelegram.work.gd)
- Bot was compromised and sending Ethereum spam messages
- Deleted unauthorized webhook and reset bot commands
- Bot security fully restored - normal operation confirmed

✅ DEPLOYMENT PREPARATION (25/07/2025)
- Added /update command to bot commands list
- Updated vercel.json to include api/update-command.js
- Webhook reconfigured to point back to Vercel production
- Ready for Vercel redeployment with complete functionality

🛡️ ULTIMATE SECURITY SYSTEM IMPLEMENTED (25/07/2025)
- Multi-layer security middleware with malicious content detection
- Ultra-secure webhook with unique token protection
- IP validation (Telegram-only access)
- Auto-cleanup system for unauthorized webhook attempts
- Protection active even if bot token is compromised

🔧 UPDATE COMMAND CALLBACK FIX (25/07/2025)
- Fixed BUTTON_DATA_INVALID error for long URLs
- Added temporary storage system for callback data
- URL IDs generated to bypass Telegram's 64-byte limit
- System now supports any length APKPure URLs
- Fully functional with new atomic-flix URL structure

📱 EXPO PUSH NOTIFICATIONS SYSTEM (25/07/2025)
- Complete Expo Push API integration created
- Push token registration system
- Real notifications support when Expo token provided


- Mobile app integration documentation provided

✓ Project migrated from Replit Agent to Replit environment (25/07/2025)
- Configured proper Node.js workflow with port 5000
- Installed all required dependencies (express, axios, canvas, node-telegram-bot-api, pg)
- Verified API endpoints functionality and error handling
- Confirmed Telegram message delivery with successful test message
- Migration completed successfully - all systems operational

🔥 POSTGRES PUSH TOKENS SYSTEM IMPLEMENTED (25/07/2025)
- Migrated from temporary memory storage to persistent PostgreSQL
- Created `expo_push_tokens` table with full indexing for performance
- Built ExpoPushTokenManager class with complete CRUD operations
- Unlimited and free storage - no more token loss on server restart
- Active tokens filtered by 30-day activity window
- Auto-cleanup system for 90+ day inactive tokens
- Real-time statistics with persistent user tracking
- Backward compatibility maintained with existing API calls

🔄 SYSTEM SIMPLIFICATION COMPLETED (26/07/2025)
- Replaced complex /update command with simple /message system
- New `/message "Title" "Message" [URL]` command format
- Created message storage system with 24h expiration
- Added /api/send-app-message and /api/check-messages/:appId endpoints
- Mobile app integration via direct message polling
- Removed push notification dependencies for simpler architecture
- Admin-only access maintained with permission checks
- Fixed Telegram bot webhook to handle new /message command format
- Implemented shared message storage with lib/messageStorage.js
- System tested and fully operational with atomic_flix_mobile_v1 app ID
- Fixed webhook to call send-app-message function directly instead of HTTP requests
- Command /message successfully tested on production with real message delivery
- Migrated message storage from memory to file-based system (/tmp/messages) for serverless persistence
- Fixed endpoint testing - messages now properly persist between API calls on Vercel
- Fixed check-messages endpoint for Vercel compatibility (URL parameter parsing)
- Added dynamic route api/check-messages/[appId].js for better Vercel URL routing support
- Cleaned up Vercel functions to stay under 12 function limit (removed security and expo-push endpoints)
- Fixed webhook imports and server.js dependencies after endpoint cleanup
- LOCAL TESTING SUCCESSFUL: /message command fully functional with message persistence and retrieval

## System Architecture

### Backend Architecture
- **Framework**: Express.js for local development with serverless function support
- **Deployment**: Vercel serverless functions
- **Runtime**: Node.js
- **API Style**: RESTful endpoints with CORS support for cross-origin requests

### Key Design Decisions
- **Serverless-first**: Each API endpoint is designed as an independent serverless function
- **Stateless operations**: No persistent storage, relying on Telegram's API for data
- **CORS-enabled**: Full cross-origin support for web and mobile app integration
- **Token-based authentication**: Uses Telegram Bot API token for authentication

## Key Components

### API Endpoints (`/api/`)
- **Health Check** (`health.js`): Bot status monitoring and connectivity verification
- **Subscription Verification** (`verify-subscription.js`): Validates user subscription to the Telegram channel
- **Bot Information** (`bot-info.js`): Retrieves comprehensive bot configuration and status
- **Message Sending** (`send-message.js`): Sends messages to users with optional inline keyboards
- **Webhook Handler** (`webhook.js`): Processes incoming Telegram updates and events
- **Command Management** (`set-commands.js`): Configures bot commands in Telegram


- **App Message System** (`send-app-message.js`): Send messages to mobile apps via storage system
- **Message Check** (`check-messages.js`): Mobile app endpoint to retrieve pending messages

### Core Library (`/lib/`)
- **Telegram Bot Client** (`telegramBot.js`): Centralized bot instance management and API wrapper
- **SVG Image Generator** (`svgImageGenerator.js`): Creates custom welcome images for new users
- **Logo Converter** (`logoConverter.js`): Handles ATOMIC FLIX branding assets
- **Database Manager** (`database.js`): PostgreSQL connection and ExpoPushTokenManager for persistent storage
- **Message Storage** (`messageStorage.js`): In-memory message storage with 24h expiration for app communication

### Configuration Files
- **Vercel Config** (`vercel.json`): Deployment settings with function-specific timeouts
- **Server** (`server.js`): Express server for local development
- **Root Handler** (`index.js`): Main entry point with API documentation

## Data Flow

1. **User Interaction**: Users interact with the Telegram bot
2. **Webhook Processing**: Telegram sends updates to the webhook endpoint
3. **Event Routing**: Updates are processed and routed to appropriate handlers
4. **Subscription Verification**: Channel membership is validated using Telegram's API
5. **Response Generation**: Appropriate messages or content is sent back to users
6. **Growth Tracking**: User engagement events trigger promotional features

## External Dependencies

### Telegram Integration
- **Primary Service**: Telegram Bot API for all bot operations
- **Channel**: @Atomic_flix_officiel (main subscription channel)
- **Bot Token**: Hardcoded for production (8136643576:AAEIwUDrBN_0LOn2eqQZdzhZZuFzaGgfNwg)

### NPM Packages
- **node-telegram-bot-api**: Core Telegram bot functionality
- **express**: Web framework for local development
- **axios**: HTTP client for external API calls
- **canvas**: Image generation capabilities for custom graphics
- **pg**: PostgreSQL driver for persistent data storage

### Content Management
- **Static Assets**: Logo and branding materials stored locally
- **Dynamic Content**: Anime-specific promotional content generated programmatically

## Deployment Strategy

### Vercel Serverless
- **Platform**: Vercel for automatic scaling and global distribution
- **Function Timeouts**: Configured per endpoint (10-15 seconds max)
- **Environment**: Production bot token embedded in code
- **CORS**: Configured for universal access to support web and mobile clients

### Development vs Production
- **Local Development**: Express server with full routing
- **Production**: Individual serverless functions with shared library code
- **Configuration**: Environment-aware bot token and channel ID management

### Scaling Considerations
- **Stateless Design**: Each function call is independent
- **Rate Limiting**: Relies on Telegram's built-in rate limits
- **Error Handling**: Comprehensive error responses with appropriate HTTP status codes