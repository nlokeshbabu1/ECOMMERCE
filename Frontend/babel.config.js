// babel.config.js
module.exports = {
    presets: [
      // Transpile modern JS features for the current Node.js version Jest runs on
      ['@babel/preset-env', { targets: { node: 'current' } }],
      // Transpile React JSX syntax. 'runtime: "automatic"' is for React 17+
      // If using an older React version, you might need 'runtime: "classic"'
      ['@babel/preset-react', { runtime: 'automatic' }],
    ],
  };