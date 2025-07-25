# ATOMIC FLIX Telegram Bot API

## Overview

This is a Telegram bot backend API for ATOMIC FLIX, an anime streaming platform. The system is built as a serverless application designed to run on Vercel, providing subscription verification, user engagement features, and promotional content for an anime streaming service.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

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
- **Channel Events** (`channel-events.js`): Handles new member events and channel interactions
- **Growth Features** (`growth-features.js`): Promotional tools to encourage channel subscription
- **Anime Promotion** (`anime-promotion.js`): Specialized content for anime platform promotion
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