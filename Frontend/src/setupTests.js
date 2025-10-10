import { TextEncoder, TextDecoder } from 'util';

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock import.meta for Jest
Object.defineProperty(global, 'import.meta', {
  value: {
    env: {
      VITE_API_URL: 'http://localhost:5000',
    },
  },
  writable: true,
});

// src/setupTests.js
import '@testing-library/jest-dom';