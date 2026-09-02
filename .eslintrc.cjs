const isProduction = process.env.NODE_ENV === 'production'

module.exports = {
  root: true,
  env: {
    node: true,
    es2022: true,
  },
  extends: ['plugin:vue/essential', '@vue/prettier', '@vue/typescript'],
  rules: {
    'no-console': isProduction ? 'error' : 'warn',
    'no-debugger': isProduction ? 'error' : 'warn',
    'no-empty': ['error', { allowEmptyCatch: true }],
    'vue/multi-word-component-names': 'off',
    // Vue 3 支持多根节点（该规则是 Vue 2 约束，当前 extends 仍是 vue2 预设 plugin:vue/essential）
    'vue/no-multiple-template-root': 'off',
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
  },
  parserOptions: {
    parser: '@typescript-eslint/parser',
  },
}
