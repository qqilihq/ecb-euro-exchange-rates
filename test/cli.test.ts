/* eslint-disable @typescript-eslint/no-floating-promises */
import * as exchangeRates from '../lib/index';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert';
import { describe, it } from 'node:test';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const rootDir = path.join(__dirname, '..');
const cliSource = path.join(rootDir, 'lib', 'cli.ts');

/** Runs the CLI from source as a real process, which is the only way its exit
 * code and its split of stdout and stderr can be observed at all. */
function runCli(preload?: string) {
  const args = ['--require', 'tsx/cjs'];
  if (preload) args.push('--require', preload);
  return promisify(execFile)(process.execPath, [...args, cliSource]);
}

describe('command line interface', { timeout: 60_000 }, () => {
  it('prints the daily rates as JSON', async () => {
    const { stdout } = await runCli();
    const parsed = JSON.parse(stdout) as exchangeRates.IExchangeRateResult;
    assert.match(parsed.time, /\d{4}-\d{2}-\d{2}/);
    assert.equal(typeof parsed.rates.USD, 'number');
  });

  it('reports a failure on stderr and exits non-zero', async () => {
    // The point of the `bin`: the previous `.catch` exited 1 while swallowing
    // the error, so a failure printed nothing at all.
    await assert.rejects(runCli(path.join(__dirname, 'fixtures', 'reject-fetch.ts')), (error: unknown) => {
      const { code, stdout, stderr } = error as { code: number; stdout: string; stderr: string };
      assert.equal(code, 1, 'the exit code is the contract for a shell');
      assert.equal(stdout, '', 'stdout stays pure JSON, so a pipeline sees nothing on failure');
      assert.match(stderr, /fetch failed/);
      return true;
    });
  });

  it('declares a `bin` whose target the build produces', () => {
    // `bin` names the built file, which does not exist on a fresh clone, so
    // what is checked is that it maps back onto a source file that does. A
    // renamed or moved `lib/cli.ts` fails here rather than after publishing.
    const { bin } = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8')) as {
      bin: Record<string, string>;
    };
    const targets = Object.values(bin);
    assert.deepEqual(targets, ['dist/cli.js']);
    for (const target of targets) {
      const source = path.join(rootDir, target.replace(/^dist\//, 'lib/').replace(/\.js$/, '.ts'));
      assert.equal(fs.existsSync(source), true, `${target} has no source at ${source}`);
    }
  });
});
