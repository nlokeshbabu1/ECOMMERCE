// micro-frontend.config.js
// Configuration for micro-frontend architecture

const microFrontendConfig = {
  services: {
    auth: {
      name: 'auth-service',
      port: 3001,
      routes: ['/login', '/register', '/forgot-password', '/reset-password'],
      importMap: './services/auth'
    },
    catalog: {
      name: 'catalog-service',
      port: 3002,
      routes: ['/', '/products', '/product/:id'],
      importMap: './services/catalog'
    },
    cart: {
      name: 'cart-service',
      port: 3003,
      routes: ['/cart'],
      importMap: './services/cart'
    },
    checkout: {
      name: 'checkout-service',
      port: 3004,
      routes: ['/checkout'],
      importMap: './services/checkout'
    },
    orders: {
      name: 'orders-service',
      port: 3005,
      routes: ['/orders'],
      importMap: './services/orders'
    },
    user: {
      name: 'user-service',
      port: 3006,
      routes: ['/settings', '/profile'],
      importMap: './services/user'
    },
    support: {
      name: 'support-service',
      port: 3007,
      routes: ['/support', '/chat'],
      importMap: './services/support'
    }
  },
  
  // Communication configuration
  communication: {
    // Event bus for inter-service communication
    eventBus: {
      enabled: true,
      events: [
        'user:login',
        'user:logout',
        'cart:updated',
        'product:added',
        'order:created'
      ]
    },
    
    // Shared state management
    sharedState: {
      user: ['sessionId', 'userRole', 'userEmail'],
      cart: ['items', 'count'],
      preferences: ['language', 'currency']
    }
  },
  
  // Service discovery and routing
  routing: {
    baseRoute: '/',
    serviceRoutes: {
      auth: '/auth',
      catalog: '/catalog',
      cart: '/cart',
      checkout: '/checkout',
      orders: '/orders',
      user: '/user',
      support: '/support'
    }
  }
};

// Export the configuration
export default microFrontendConfig;