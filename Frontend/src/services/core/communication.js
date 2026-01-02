// src/services/core/communication.js
// Service communication module for micro-frontend architecture

// Event bus for inter-service communication
class EventBus {
  constructor() {
    this.events = {};
  }

  // Subscribe to an event
  subscribe(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  }

  // Unsubscribe from an event
  unsubscribe(event, callback) {
    if (this.events[event]) {
      this.events[event] = this.events[event].filter(cb => cb !== callback);
    }
  }

  // Publish an event
  publish(event, data) {
    if (this.events[event]) {
      this.events[event].forEach(callback => callback(data));
    }
  }
}

// Shared state management
class SharedState {
  constructor() {
    this.state = {
      user: {
        sessionId: null,
        userRole: null,
        userEmail: null
      },
      cart: {
        items: [],
        count: 0
      },
      preferences: {
        language: 'en',
        currency: 'INR'
      }
    };
    this.listeners = {};
  }

  // Get state
  getState(key) {
    return this.state[key];
  }

  // Set state and notify listeners
  setState(key, value) {
    this.state[key] = { ...this.state[key], ...value };
    this.notifyListeners(key);
  }

  // Subscribe to state changes
  subscribe(key, callback) {
    if (!this.listeners[key]) {
      this.listeners[key] = [];
    }
    this.listeners[key].push(callback);
  }

  // Notify listeners of state changes
  notifyListeners(key) {
    if (this.listeners[key]) {
      this.listeners[key].forEach(callback => callback(this.state[key]));
    }
  }
}

// Initialize singletons
const eventBus = new EventBus();
const sharedState = new SharedState();

// Export the communication utilities
export { eventBus, sharedState };

// Utility functions for common operations
export const authService = {
  login: (data) => {
    sharedState.setState('user', {
      sessionId: data.sessionId,
      userRole: data.role,
      userEmail: data.userEmail
    });
    eventBus.publish('user:login', data);
  },
  
  logout: () => {
    sharedState.setState('user', {
      sessionId: null,
      userRole: null,
      userEmail: null
    });
    sharedState.setState('cart', {
      items: [],
      count: 0
    });
    eventBus.publish('user:logout', {});
  }
};

export const cartService = {
  updateCart: (items) => {
    const count = items.reduce((acc, item) => acc + item.quantity, 0);
    sharedState.setState('cart', {
      items,
      count
    });
    eventBus.publish('cart:updated', { items, count });
  }
};

export const productService = {
  addProduct: (product) => {
    eventBus.publish('product:added', product);
  }
};

export const orderService = {
  createOrder: (order) => {
    eventBus.publish('order:created', order);
  }
};