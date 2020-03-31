module.exports = {
  env: {
    node: true,
    es6: true,
    jest: true
  },
  extends: [
    // https://github.com/typescript-eslint/typescript-eslint/tree/master/packages/eslint-plugin#recommended-configs
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    // https://github.com/typescript-eslint/typescript-eslint/blob/master/docs/getting-started/linting/TYPED_LINTING.md
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    // https://www.robertcooper.me/using-eslint-and-prettier-in-a-typescript-project
    'plugin:prettier/recommended'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
    tsconfigRootDir: __dirname,
    project: ['./tsconfig.json']
  },
  plugins: [
    '@typescript-eslint'
  ],
  rules: {
    '@typescript-eslint/interface-name-prefix': [ 2, { prefixWithI: 'always' } ],
    // probably re-enable these later
    '@typescript-eslint/ban-ts-ignore': 0,
    '@typescript-eslint/no-explicit-any': 0,
    '@typescript-eslint/explicit-function-return-type': 0,
    '@typescript-eslint/no-use-before-define': 0
  }
};
