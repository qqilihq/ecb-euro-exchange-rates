#!/usr/bin/env node
import { fetch } from './index';

/**
 * Prints the current daily reference rates as JSON, for a shell or a cron job:
 *
 *     npx ecb-euro-exchange-rates | jq '.rates.USD'
 *
 * Declared as the package's `bin`, so the shebang above is what makes it
 * runnable once npm has linked it.
 */
fetch()
  .then((result) => {
    console.log(JSON.stringify(result, null, 2));
  })
  .catch((error: unknown) => {
    // Reported on stderr, so a pipeline's stdout carries only JSON.
    console.error(error instanceof Error ? error.message : error);
    // eslint-disable-next-line n/no-process-exit -- CLI entry point; a non-zero exit code is the contract
    process.exit(1);
  });
