import type { KnipConfig } from 'knip';

const config: KnipConfig = {
  // `main` and `types` point into dist/, which only exists after a build.
  // Point Knip at the source instead, so it behaves the same on a fresh clone.
  entry: ['lib/index.ts', 'test/**/*.test.ts'],
  project: ['lib/**/*.ts', 'test/**/*.ts', '*.ts']
};

export default config;
