module.exports = {
  hooks: {
    'pre-commit': 'yarn lint',
    'commit-msg': 'commitlint -E HUSKY_GIT_PARAMS'
  }
};
