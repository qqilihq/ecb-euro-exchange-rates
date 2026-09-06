/* eslint-disable @typescript-eslint/no-floating-promises */
import * as exchangeRates from '../lib/index';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert';
import { describe, it } from 'node:test';

// retrieving the history takes a bit of time
describe('ECB exchange rates', { timeout: 60_000 }, () => {
  it('parses XML', async () => {
    const xml = await fs.promises.readFile(path.join(__dirname, 'eurofxref-daily.xml'), { encoding: 'utf8' });
    const parsed = exchangeRates.parse(xml);
    assert.deepEqual(parsed, [
      {
        time: '2023-04-06',
        rates: {
          USD: 1.0915,
          JPY: 143.49,
          BGN: 1.9558,
          CZK: 23.409,
          DKK: 7.451,
          GBP: 0.87495,
          HUF: 376.1,
          PLN: 4.6863,
          RON: 4.9369,
          SEK: 11.3875,
          CHF: 0.9878,
          ISK: 149.7,
          NOK: 11.3855,
          TRY: 21.0195,
          AUD: 1.6312,
          BRL: 5.5096,
          CAD: 1.4704,
          CNY: 7.5014,
          HKD: 8.5682,
          IDR: 16290.63,
          ILS: 3.9261,
          INR: 89.3655,
          KRW: 1438.81,
          MXN: 19.9624,
          MYR: 4.8015,
          NZD: 1.7387,
          PHP: 59.562,
          SGD: 1.4507,
          THB: 37.171,
          ZAR: 19.8929,
        },
      },
    ]);
  });

  it('documents exactly the supported currencies in the readme', async () => {
    const readme = await fs.promises.readFile(path.join(__dirname, '..', 'readme.md'), { encoding: 'utf8' });
    const documented = [...readme.matchAll(/^- \*\*([A-Z]{3})\*\*/gm)].map((match) => match[1]);
    assert.deepEqual(documented.sort(), [...exchangeRates.currencies].sort());
  });

  describe('retrieve exchange rates', function () {
    it('retrieves exchange rates', async () => {
      const result = await exchangeRates.fetch();
      assert.equal(typeof result, 'object');
      assert.equal(typeof result.time, 'string');
      assert.match(result.time, /\d{4}-\d{2}-\d{2}/);
      assert.equal(typeof result.rates, 'object');
      assert.equal(typeof result.rates.USD, 'number');
      // compared against the exported list rather than a copy of it, so the two
      // cannot drift apart. Order is not part of the API contract, hence sorted.
      assert.deepEqual(Object.keys(result.rates).sort(), [...exchangeRates.currencies].sort());
    });

    it('retrieves historic exchange rates', async () => {
      const result = await exchangeRates.fetchHistoric90d();
      assert.equal(Array.isArray(result), true);
      assert.equal(result.length > 50, true);
      assert.equal(typeof result[0], 'object');
      assert.equal(typeof result[0]!.time, 'string');
      assert.equal(typeof result[0]!.rates, 'object');
      assert.equal(typeof result[0]!.rates.USD, 'number');

      // A 90-day window cannot be checked like the full history, because it contains
      // none of the discontinued currencies. What must hold is that it introduces no
      // code outside the two exported lists, and that every current currency appears
      // somewhere in it. Both survive a retirement, when the window keeps carrying the
      // retired currency for up to 90 days after it leaves `currencies`.
      const known: readonly string[] = [...exchangeRates.currencies, ...exchangeRates.discontinuedCurrencies];
      const union = new Set<string>();
      for (const entry of result) {
        for (const code of Object.keys(entry.rates)) union.add(code);
      }
      assert.deepEqual(
        [...union].filter((code) => !known.includes(code)),
        [],
        'the 90-day feed contains currencies that are in neither exported list',
      );
      assert.deepEqual(
        exchangeRates.currencies.filter((code) => !union.has(code)),
        [],
        'the 90-day feed is missing currencies that are listed as current',
      );
    });

    it('retrieves all historic exchange rates', async () => {
      const result = await exchangeRates.fetchHistoric();
      assert.equal(Array.isArray(result), true);
      assert.equal(result.length > 5000, true);
      assert.equal(typeof result[0], 'object');
      assert.equal(typeof result[0]!.time, 'string');
      assert.equal(typeof result[0]!.rates, 'object');
      assert.equal(typeof result[0]!.rates.USD, 'number');
      assert.equal(result[result.length - 1]!.time, '1999-01-04');

      // the union across the whole history must match the two exported lists, so a
      // currency appearing or disappearing upstream shows up here instead of
      // silently widening the runtime shape beyond what the types describe
      const union = new Set<string>();
      for (const entry of result) {
        for (const code of Object.keys(entry.rates)) union.add(code);
      }
      assert.deepEqual(
        [...union].sort(),
        [...exchangeRates.currencies, ...exchangeRates.discontinuedCurrencies].sort(),
      );

      // why the historic rates are optional: the oldest entry predates several of
      // the currencies published today
      const oldest = result[result.length - 1]!;
      assert.equal(Object.keys(oldest.rates).length < exchangeRates.currencies.length, true);
    });
  });
});
