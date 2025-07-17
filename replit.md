# Atomic Flix Telegram Backend

## Overview

This is a Node.js backend service deployed on Vercel that verifies Telegram channel subscriptions for the ATOMIC FLIX mobile application. The service uses the Telegram Bot API to check if users are subscribed to the @Atomic_flix_officiel channel.

**Status: ✅ COMPLETED - Backend fully functional and ready for deployment**

## Recent Changes

### July 17, 2025
- ✅ Created complete backend architecture with all required endpoints
- ✅ Implemented Telegram Bot API integration using `node-telegram-bot-api`
- ✅ Configured bot token authentication (BOT_TOKEN environment variable)
- ✅ **UPDATED: Integrated bot token directly in code** (8136643576:AAEIwUDrBN_0LOn2eqQZdzhZZuFzaGgfNwg)
- ✅ Added comprehensive error handling for all Telegram API scenarios
- ✅ Tested all endpoints locally - health check and subscription verification working
- ✅ Created README.md with complete documentation and usage examples
- ✅ Configured CORS for React Native mobile app integration
- ✅ Added local development server (server.js) for testing purposes
- ✅ Simplified deployment by removing environment variable requirements

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Backend Architecture
- **Platform**: Vercel serverless functions
- **Runtime**: Node.js
- **Framework**: Express-style serverless functions
- **API Pattern**: RESTful endpoints with CORS support

### Key Design Decisions
- **Serverless Functions**: Chosen for scalability and cost-effectiveness on Vercel
- **Stateless Design**: Each function call is independent, no persistent connections
- **CORS Configuration**: Configured for React Native mobile app consumption
- **Error Handling**: Comprehensive error handling for Telegram API edge cases

## Key Components

### API Endpoints
1. **Health Check** (`/api/health.js`)
   - GET endpoint to verify bot status
   - Returns bot information and configuration
   - Used for monitoring and debugging

2. **Subscription Verification** (`/api/verify-subscription.js`)
   - POST endpoint to check user subscription status
   - Validates user membership in Telegram channel
   - Returns subscription status and user information

### Core Library
- **Telegram Bot Handler** (`/lib/telegramBot.js`)
  - Manages bot instance creation
  - Handles subscription verification logic
  - Provides error handling for common Telegram API issues

## Data Flow

1. **Health Check Flow**:
   - Client → GET `/api/health` → Telegram Bot API → `getMe()` → Response

2. **Subscription Verification Flow**:
   - Client → POST `/api/verify-subscription` with `userId` → Telegram Bot API → `getChatMember()` → Subscription status response

## External Dependencies

### Third-party Services
- **Telegram Bot API**: Primary integration for user verification
- **Vercel**: Hosting platform for serverless functions

### NPM Packages
- `node-telegram-bot-api`: Official Telegram Bot API wrapper
- Built-in Node.js modules for HTTP handling

### Authentication
- Bot token authentication with Telegram API
- Environment variable-based configuration

## Deployment Strategy

### Environment Variables
- `BOT_TOKEN`: Telegram bot authentication token
- `CHANNEL_ID`: Target channel identifier (@Atomic_flix_officiel)

### Vercel Configuration
- **Build Process**: Automatic deployment from source
- **Function Timeouts**: 10s for health, 15s for verification
- **CORS**: Configured for cross-origin requests from mobile app
- **Error Handling**: Comprehensive error responses for client debugging

### Monitoring
- Built-in health check endpoint for service monitoring
- Structured logging for debugging and maintenance
- Error categorization for different failure modes

## Error Handling Strategy

The system handles various Telegram API error scenarios:
- User not found in system
- Channel access issues
- Bot authorization problems
- Network connectivity issues
- Invalid request parameters

Each error type returns appropriate HTTP status codes and structured error messages for client-side handling.