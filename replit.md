# ATOMIC FLIX Telegram Bot API

## Overview

This is a Telegram bot backend API for ATOMIC FLIX, an anime streaming platform. The system is built as a serverless application designed to run on Vercel, providing subscription verification, user engagement features, and promotional content for an anime streaming service.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

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
- Push token registration system with demo mode
- Real notifications support when Expo token provided
- Fallback simulation mode for testing without app config
- 3 demo users automatically registered for immediate testing
- Mobile app integration documentation provided

✓ Project migrated from Replit Agent to Replit environment (25/07/2025)
- Configured proper Node.js workflow with port 5000
- Installed all required dependencies (express, axios, canvas, node-telegram-bot-api)
- Verified API endpoints functionality and error handling
- Confirmed Telegram message delivery with successful test message
- Migration completed successfully - all systems operational

✓ Added `/update` command for push notifications (25/07/2025)
- Created new API endpoint `/api/update-command`
- Integrated with webhook handler for button callbacks
- Admin-only functionality with APKPure URL validation
- Simulated push notification system ready for production integration

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


- **Update Command** (`update-command.js`): Admin-only command to send push notifications for app updates

### Core Library (`/lib/`)
- **Telegram Bot Client** (`telegramBot.js`): Centralized bot instance management and API wrapper
- **SVG Image Generator** (`svgImageGenerator.js`): Creates custom welcome images for new users
- **Logo Converter** (`logoConverter.js`): Handles ATOMIC FLIX branding assets

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