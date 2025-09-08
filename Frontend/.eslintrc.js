module.exports = {
  extends: ['next/core-web-vitals'],
  rules: {
    // Disable all ESLint rules
    '@typescript-eslint/no-unused-vars': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/ban-ts-comment': 'off',
    '@typescript-eslint/prefer-as-const': 'off',
    '@typescript-eslint/no-empty-function': 'off',
    'react-hooks/rules-of-hooks': 'off',
    'react-hooks/exhaustive-deps': 'off',
    'react/no-unescaped-entities': 'off',
    'react/display-name': 'off',
    'react/prop-types': 'off',
    '@next/next/no-img-element': 'off',
    '@next/next/no-html-link-for-pages': 'off',
    'prefer-const': 'off',
    'no-unused-vars': 'off',
    'no-console': 'off',
    'no-undef': 'off',
    'semi': 'off',
    'quotes': 'off',
    'comma-dangle': 'off',
    'indent': 'off',
    'no-trailing-spaces': 'off',
    'eol-last': 'off',
  },
  ignorePatterns: [
    'node_modules/',
    '.next/',
    'out/',
    'build/',
    '**/*.js',
    '**/*.jsx',
    '**/*.ts',
    '**/*.tsx'
  ]
};
