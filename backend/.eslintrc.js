module.exports = {
  env: {
    node: true,
    es2021: true,
    commonjs: true
  },
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module'
  },
  rules: {
    // Disable all ESLint rules
    'no-unused-vars': 'off',
    'no-console': 'off',
    'no-undef': 'off',
    'no-process-exit': 'off',
    'no-unused-expressions': 'off',
    'no-empty': 'off',
    'no-constant-condition': 'off',
    'no-unreachable': 'off',
    'no-redeclare': 'off',
    'prefer-const': 'off',
    'semi': 'off',
    'quotes': 'off',
    'comma-dangle': 'off',
    'indent': 'off',
    'no-trailing-spaces': 'off',
    'eol-last': 'off',
    'object-curly-spacing': 'off',
    'space-before-function-paren': 'off',
    'keyword-spacing': 'off',
    'space-infix-ops': 'off',
    'no-multiple-empty-lines': 'off',
    'padded-blocks': 'off',
    'no-extra-semi': 'off',
    'no-mixed-spaces-and-tabs': 'off',
    'camelcase': 'off',
    'new-cap': 'off'
  },
  ignorePatterns: [
    'node_modules/',
    'dist/',
    'build/',
    'coverage/',
    '**/*.min.js',
    '**/*.bundle.js',
    '**/*.test.js',
    '**/*.spec.js'
  ]
};
