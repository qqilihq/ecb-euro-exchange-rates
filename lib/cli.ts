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
    // `process.exitCode` rather than `process.exit(1)`: writes to a piped
    // stderr are asynchronous on macOS, and exiting outright discards whatever
    // has not drained -- everything past the 64 KiB pipe buffer. Nothing else
    // keeps the loop alive here, so the process still ends with status 1.
    process.exitCode = 1;
  });
