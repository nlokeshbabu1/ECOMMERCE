// Mock import.meta for Jest
Object.defineProperty(global, 'import.meta', {
    value: {
      env: {
        VITE_API_URL: 'http://localhost:5000',
      },
    },
    writable: true,
  });
