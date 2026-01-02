# E-Commerce Frontend Microservice Architecture

This document describes the microservice architecture implemented for the frontend of the e-commerce application.

## Architecture Overview

The frontend has been transformed from a monolithic React application to a micro-frontend architecture with the following services:

### Core Service
- **Purpose**: Core application shell, layout, and routing
- **Location**: `/src/services/core/`
- **Responsibilities**: Main layout, header, footer, global state management

### Authentication Service
- **Purpose**: User authentication and registration
- **Location**: `/src/services/auth/`
- **Responsibilities**: Login, registration, password reset

### Catalog Service
- **Purpose**: Product catalog and search
- **Location**: `/src/services/catalog/`
- **Responsibilities**: Product listings, search, filtering, product details

### Cart Service
- **Purpose**: Shopping cart functionality
- **Location**: `/src/services/cart/`
- **Responsibilities**: Cart management, item addition/removal

### Checkout Service
- **Purpose**: Order processing and payment
- **Location**: `/src/services/checkout/`
- **Responsibilities**: Order creation, payment processing

### Orders Service
- **Purpose**: Order history and management
- **Location**: `/src/services/orders/`
- **Responsibilities**: Order history, order details

### User Service
- **Purpose**: User profile and settings
- **Location**: `/src/services/user/`
- **Responsibilities**: User settings, profile management

### Support Service
- **Purpose**: Customer support and chat
- **Location**: `/src/services/support/`
- **Responsibilities**: Chatbot, customer support

## Communication Mechanisms

### Event Bus
- Services communicate through a centralized event bus
- Events include: `user:login`, `user:logout`, `cart:updated`, `product:added`, `order:created`

### Shared State
- User state: sessionId, userRole, userEmail
- Cart state: items, count
- Preferences: language, currency

## Deployment

Each service can be deployed independently with its own:
- Kubernetes deployment
- Service
- Health checks and resource limits

## Development

To run individual services during development:
- `npm run dev:core` - Runs the core service on port 3000
- `npm run dev:auth` - Runs the auth service on port 3001
- `npm run dev:catalog` - Runs the catalog service on port 3002
- `npm run dev:cart` - Runs the cart service on port 3003
- `npm run dev:checkout` - Runs the checkout service on port 3004
- `npm run dev:orders` - Runs the orders service on port 3005
- `npm run dev:user` - Runs the user service on port 3006
- `npm run dev:support` - Runs the support service on port 3007

## Benefits

1. **Independent Development**: Teams can work on different services without conflicts
2. **Independent Deployment**: Services can be deployed independently
3. **Scalability**: Individual services can be scaled based on demand
4. **Technology Flexibility**: Different services can potentially use different technologies
5. **Fault Isolation**: Issues in one service don't necessarily affect others