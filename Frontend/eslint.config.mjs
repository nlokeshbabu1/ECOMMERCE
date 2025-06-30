<<<<<<< HEAD
import js from "@eslint/js";
import globals from "globals";
import pluginReact from "eslint-plugin-react";
import { defineConfig } from "eslint/config";


export default defineConfig([
  { files: ["**/*.{js,mjs,cjs,jsx}"], plugins: { js }, extends: ["js/recommended"] },
  { files: ["**/*.js"], languageOptions: { sourceType: "script" } },
  { files: ["**/*.{js,mjs,cjs,jsx}"], languageOptions: { globals: globals.browser } },
  pluginReact.configs.flat.recommended,
]);
=======
import globals from 'globals';
import pluginJs from '@eslint/js';
import pluginReact from 'eslint-plugin-react'; // Import the plugin directly

export default [
  {
    // Global settings for all files
    linterOptions: {
      noInlineConfig: false, // Allows inline comments for disabling rules
      reportUnusedDisableDirectives: 'warn', // Reports unused disable comments
    },
    languageOptions: {
      parserOptions: {
        ecmaVersion: 2021,
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...globals.browser,
        ...globals.node, // Ensure Node.js globals are available for config files
      },
    },
    plugins: {
      react: pluginReact, // Use the imported plugin directly
    },
    rules: {
      ...pluginJs.configs.recommended.rules, // Apply recommended JS rules
      ...pluginReact.configs.recommended.rules, // Apply recommended React rules
      'indent': [
        'error',
        2,
        {
          'SwitchCase': 1, // Indent switch cases by 1 level
          'ignoredNodes': ['TemplateLiteral'], // Ignore template literals for indentation
        }
      ],
      'linebreak-style': [
        'error',
        'unix',
      ],
      'quotes': [
        'error',
        'single',
        { 'avoidEscape': true, 'allowTemplateLiterals': true } // Allow template literals with backticks
      ],
      'semi': [
        'error',
        'always',
      ],
      // Warn for unused variables, but ignore those starting with _ or _unused
      'no-unused-vars': [
        'warn',
        { 'argsIgnorePattern': '^_', 'varsIgnorePattern': '^_unused' }
      ],
      // Disable prop-types validation as it's often not used with TypeScript or newer React patterns
      'react/prop-types': 'off',
      // Disable the need to import React explicitly in JSX files for React 17+
      'react/react-in-jsx-scope': 'off',
    },
    settings: {
      react: {
        version: 'detect' // Automatically detect the React version
      }
    }
  },
  {
    // Specific overrides for tailwind.config.js and vite.config.js
    files: ['tailwind.config.js', 'vite.config.js', 'postcss.config.mjs', 'eslint.config.mjs'],
    languageOptions: {
      sourceType: 'module',
      globals: {
        ...globals.node // Ensure Node.js globals for these files
      }
    },
    rules: {
      // Allow console logs in config files for debugging if needed
      'no-console': 'off',
      // The 'js' variable in eslint.config.mjs is from @eslint/js; it's a known pattern.
      // We explicitly ignore it for no-unused-vars here, specific to eslint.config.mjs
      'no-unused-vars': [
        'warn',
        {
          'argsIgnorePattern': '^_',
          'varsIgnorePattern': '^(js|pluginReact)$' // Updated to ignore 'pluginReact'
        }
      ]
    }
  },
];
>>>>>>> feature
