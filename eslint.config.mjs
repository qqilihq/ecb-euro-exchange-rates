import eslint from '@eslint/js';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';
import eslintPluginN from 'eslint-plugin-n';
// turns off the rules that would fight Prettier; Prettier itself runs as its
// own `lint:format` script rather than as an ESLint rule
import eslintConfigPrettier from 'eslint-config-prettier';

export default defineConfig(
  {
    // compiled output; not source
    ignores: ['dist/**', 'coverage/**'],
  },
  eslint.configs.recommended,
  tseslint.configs.recommendedTypeChecked,
  eslintPluginN.configs['flat/recommended'],
  eslintConfigPrettier,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // report APIs marked @deprecated in their JSDoc
      '@typescript-eslint/no-deprecated': 'error',

      // not part of eslint-plugin-n's recommended set, but cheap to keep honest
      'n/prefer-node-protocol': 'error',

      // The rule resolves `package.json`'s `bin` the way Node would, so it
      // compares `dist/cli.js` against the source path and concludes the CLI
      // needs no shebang. Naming the source file as an executable tells it the
      // truth, rather than switching the rule off: a shebang missing from
      // `lib/cli.ts`, or present anywhere else, is still reported.
      'n/hashbang': ['error', { additionalExecutables: ['lib/cli.ts'] }],

      // TypeScript resolves these imports (extensionless, and `.ts` once this
      // package moves to ESM); the rule resolves them the way Node would and
      // reports every one. `lint:types` already proves each import resolves.
      'n/no-missing-import': 'off',
    },
  },
  {
    files: ['**/*.mjs'],
    rules: {
      // `engines.node` is the floor for consumers of the published package.
      // Config files are neither published nor run by them -- they run on the
      // version pinned in `devEngines.runtime` -- so they may use newer APIs.
      'n/no-unsupported-features/node-builtins': 'off',
    },
  },
);
