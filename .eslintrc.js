module.exports = {
  env: {
    browser: true,
    es2020: true
  },
  extends: ['eslint:recommended', 'prettier'],
  parser: 'babel-eslint',
  parserOptions: {
    ecmaVersion: 11,
    sourceType: 'module'
  },
  plugins: ['prettier'],
  rules: {
    'no-console': 'off',
    'prettier/prettier': 'error',
    'max-classes-per-file': ['error', 1],
    'no-unused-vars': 'off',
    'no-redeclare': 'off',
    'no-inner-declarations': 'off',
    'no-useless-escape': 'off'
  }
};
