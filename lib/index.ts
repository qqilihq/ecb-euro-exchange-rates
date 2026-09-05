import { XMLParser } from 'fast-xml-parser';

/**
 * The currencies for which the ECB publishes reference rates, in the order the
 * API returns them.
 *
 * This array is the single source of truth: {@link Currency} and
 * {@link IExchangeRates} are derived from it, and the tests compare it against
 * both the live API and the list in the readme.
 *
 * It is deliberately *not* enforced at runtime. If the ECB adds or drops a
 * currency, {@link parse} keeps returning whatever the API provides rather
 * than throwing at consumers; the failing test is the signal to update this
 * list and cut a release.
 */
export const currencies = [
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
] as const;

export type Currency = (typeof currencies)[number];

export type IExchangeRates = Record<Currency, number>;

export interface IExchangeRateResult {
  time: string;
  rates: IExchangeRates;
}

const baseUrl = 'https://www.ecb.europa.eu/stats/eurofxref';

// http://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/index.en.html

export async function fetch(): Promise<IExchangeRateResult> {
  const result = await get(`${baseUrl}/eurofxref-daily.xml`);
  const rates = parse(result);
  const [first] = rates;
  // `first` is checked as well as the length, because indexed access is not
  // narrowed by the length check under `noUncheckedIndexedAccess`
  if (rates.length !== 1 || !first) {
    throw new Error(`Expected result to contain one single entry, but got ${rates.length}`);
  }
  return first;
}

export async function fetchHistoric(): Promise<IExchangeRateResult[]> {
  return parse(await get(`${baseUrl}/eurofxref-hist.xml`));
}

export async function fetchHistoric90d(): Promise<IExchangeRateResult[]> {
  return parse(await get(`${baseUrl}/eurofxref-hist-90d.xml`));
}

async function get(url: string): Promise<string> {
  const result = await global.fetch(url);
  return await result.text();
}

export function parse(string: string): IExchangeRateResult[] {
  const data = new XMLParser({ ignoreAttributes: false, isArray: () => true }).parse(string);
  const result: IExchangeRateResult[] = [];
  const entries = data['gesmes:Envelope'][0]['Cube'][0]['Cube'];
  if (typeof entries !== 'object') {
    throw new Error('Result data does not have the expected structure');
  }

  for (const current of entries) {
    const time = current?.['@_time']?.[0];
    assertString(time, 'time');
    const rates = {} as any;
    for (const item of current['Cube']) {
      const currency = item['@_currency']?.[0];
      assertString(currency, 'curency');
      const rateString = item['@_rate']?.[0];
      assertString(rateString, 'rate');
      const rate = parseFloat(rateString);
      rates[currency] = rate;
    }

    result.push({ time, rates });
  }

  return result;
}

function assertString(value: unknown, valueName: string): asserts value is string {
  if (typeof value !== 'string') {
    throw new Error(`Expected ${valueName} to be a string`);
  }
}

// CLI only when module is not require'd
if (require.main === module) {
  (async () => {
    const result = await fetch();
    console.log(JSON.stringify(result, null, 2));
  })().catch(() => {
    // eslint-disable-next-line n/no-process-exit -- CLI entry point; a non-zero exit code is the contract
    process.exit(1);
  });
}
