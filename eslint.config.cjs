// eslint.config.cjs
const { defineConfig, globalIgnores } = require('eslint/config');
const globals = require('globals');
const tsParser = require('@typescript-eslint/parser');
const n8nNodesBase = require('eslint-plugin-n8n-nodes-base');
const jsConfigs = require('@eslint/js').configs;
const { FlatCompat } = require('@eslint/eslintrc');

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: jsConfigs.recommended,
  allConfig: jsConfigs.all,
});

module.exports = defineConfig([
  // 1) core JS/TS parsing + env
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parser: tsParser,
      sourceType: 'module',
      parserOptions: {
        project: ['./tsconfig.json'],
        extraFileExtensions: ['.json'],
      },
    },
  },

  // 2) ignore dist/node_modules/_generated files
  globalIgnores(['**/node_modules/**', '**/dist/**']),

  // 3) package.json community rules
  {
    files: ['package.json'],
    plugins: { 'n8n-nodes-base': n8nNodesBase },
    extends: compat.extends('plugin:n8n-nodes-base/community'),
    rules: {
      'n8n-nodes-base/community-package-json-name-still-default': 'off',
    },
  },

  // 4) credentials definitions
  {
    files: ['credentials/**/*.ts'],
    plugins: { 'n8n-nodes-base': n8nNodesBase },
    extends: compat.extends('plugin:n8n-nodes-base/credentials'),
    rules: {
      'n8n-nodes-base/cred-class-field-documentation-url-missing': 'off',
      'n8n-nodes-base/cred-class-field-documentation-url-miscased': 'off',
    },
  },

  // 5) node implementations
  {
    files: ['nodes/**/*.ts'],
    plugins: { 'n8n-nodes-base': n8nNodesBase },
    extends: compat.extends('plugin:n8n-nodes-base/nodes'),
    rules: {
      'n8n-nodes-base/node-execute-block-missing-continue-on-fail': 'off',
      'n8n-nodes-base/node-resource-description-filename-against-convention': 'off',
      'n8n-nodes-base/node-param-fixed-collection-type-unsorted-items': 'off',
      'n8n-nodes-base/node-class-description-inputs-wrong-regular-node': 'off',
      'n8n-nodes-base/node-class-description-outputs-wrong': 'off',
    },
  },
]);
