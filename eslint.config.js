import eslint from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import eslintPluginVue from 'eslint-plugin-vue';
import prettier from 'eslint-plugin-prettier';
import globals from 'globals';

export default [
  eslint.configs.recommended,
  {
    files: ['**/*.{js,ts,vue}'],
    plugins: {
      '@typescript-eslint': tseslint,
      'vue': eslintPluginVue,
      'prettier': prettier,
    },
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parser: tsparser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      'vue/multi-word-component-names': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        ignoreRestSiblings: true,
        args: 'none'
      }],
      'prettier/prettier': 'error',
      'no-undef': 'error',
      'no-unused-vars': 'off',
      'no-case-declarations': 'off',
    },
  },
  {
    files: ['**/*.vue'],
    plugins: {
      'vue': eslintPluginVue,
    },
    processor: eslintPluginVue.processors['.vue'],
    rules: {
      ...eslintPluginVue.configs.recommended.rules,
    },
  },
]; 