module.exports = {
  rules: {
    'type-enum': [2, 'always', ['breaking', 'update', 'new', 'fix', 'docs', 'build', 'upgrade', 'chore']],
    'type-empty': [2, 'never'],
    'type-case': [2, 'always', 'lower-case'],
    'header-max-length': [1, 'always', 72]
  }
};
