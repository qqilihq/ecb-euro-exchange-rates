/* eslint-disable @typescript-eslint/no-floating-promises */
import * as exchangeRates from '../lib/index';
import fs from 'fs';
import path from 'path';
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
          ZAR: 19.8929
        }
      }
    ]);
  });

  describe('retrieve exchange rates', function () {
    it('retrieves exchange rates', async () => {
      const result = await exchangeRates.fetch();
      assert.equal(typeof result, 'object');
      assert.equal(typeof result.time, 'string');
      assert.match(result.time, /\d{4}-\d{2}-\d{2}/);
      assert.equal(typeof result.rates, 'object');
      assert.equal(typeof result.rates.USD, 'number');
      assert.deepEqual(Object.keys(result.rates), [
        'USD',
        'JPY',
        'CZK',
        'DKK',
        'GBP',
        'HUF',
        'PLN',
        'RON',
        'SEK',
        'CHF',
        'ISK',
        'NOK',
        'TRY',
        'AUD',
        'BRL',
        'CAD',
        'CNY',
        'HKD',
        'IDR',
        'ILS',
        'INR',
        'KRW',
        'MXN',
        'MYR',
        'NZD',
        'PHP',
        'SGD',
        'THB',
        'ZAR'
      ]);
    });

    it('retrieves historic exchange rates', async () => {
      const result = await exchangeRates.fetchHistoric90d();
      assert.equal(Array.isArray(result), true);
      assert.equal(result.length > 50, true);
      assert.equal(typeof result[0], 'object');
      assert.equal(typeof result[0].time, 'string');
      assert.equal(typeof result[0].rates, 'object');
      assert.equal(typeof result[0].rates.USD, 'number');
    });

    it('retrieves all historic exchange rates', async () => {
      const result = await exchangeRates.fetchHistoric();
      assert.equal(Array.isArray(result), true);
      assert.equal(result.length > 5000, true);
      assert.equal(typeof result[0], 'object');
      assert.equal(typeof result[0].time, 'string');
      assert.equal(typeof result[0].rates, 'object');
      assert.equal(typeof result[0].rates.USD, 'number');
      assert.equal(result[result.length - 1].time, '1999-01-04');
    });
  });
});
