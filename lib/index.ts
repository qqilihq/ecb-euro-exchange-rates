import { XMLParser } from 'fast-xml-parser';

/**
 * The currencies the ECB publishes in its *current* daily feed, in the order
 * the API returns them. Every one of these is present in a {@link fetch}
 * result; historic results are a different matter, see
 * {@link discontinuedCurrencies}.
 *
 * This array is the single source of truth: {@link Currency} and
 * {@link IExchangeRates} are derived from it, and the tests compare it against
 * both the live API and the list in the readme.
 *
 * It is deliberately *not* enforced at runtime. If the ECB adds or drops a
 * currency, {@link parse} keeps returning whatever the API provides rather
 * than throwing at consumers; the failing test is the signal to update this
 * list and cut a release.
 *
 * Frozen, because `readonly` exists only in the type system: this is the very
 * array the tests and consumers read, so a write to it would change what
 * every other caller in the process sees.
 */
export const currencies = Object.freeze([
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
  'ZAR',
] as const);

export type Currency = (typeof currencies)[number];

/**
 * Currencies that appear only in the historic feeds, because the ECB stopped
 * publishing them — most because the country adopted the euro.
 *
 * Kept separate from {@link currencies} so the common case ({@link fetch}) does
 * not have to account for rates that no current response can contain.
 *
 * Frozen, for the same reason as {@link currencies}.
 */
export const discontinuedCurrencies = Object.freeze([
  'BGN',
  'CYP',
  'EEK',
  'HRK',
  'LTL',
  'LVL',
  'MTL',
  'ROL',
  'RUB',
  'SIT',
  'SKK',
  'TRL',
] as const);

export type HistoricCurrency = Currency | (typeof discontinuedCurrencies)[number];

/** Rates from the daily feed, where every current currency is present. */
export type IExchangeRates = Record<Currency, number>;

/**
 * Rates from a historic feed. Every rate is optional: which currencies a given
 * day carries depends on the date. The 1999-01-04 entry, for instance, holds 27
 * rates and is missing 11 of the currencies published today, because they were
 * not yet part of the reference rates.
 */
export type IHistoricExchangeRates = Partial<Record<HistoricCurrency, number>>;

export interface IExchangeRateResult {
  time: string;
  rates: IExchangeRates;
}

export interface IHistoricExchangeRateResult {
  time: string;
  rates: IHistoricExchangeRates;
}

const baseUrl = 'https://www.ecb.europa.eu/stats/eurofxref';

// https://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/index.en.html

/**
 * Retrieves the current daily reference rates, which the ECB publishes on
 * working days at around 16:00 CET.
 *
 * Nothing is reported through the result: every failure rejects the promise,
 * so wrap the call if a failed update should not take the caller down with it.
 *
 * | what happens | how it rejects |
 * | --- | --- |
 * | the request never completes -- DNS, refused connection, timeout | `TypeError` from `globalThis.fetch` |
 * | the ECB answers with an error status | `Error: Request to … failed with status …` |
 * | the body is not the expected feed | `Error: Result data does not have the expected structure` |
 * | the feed carries other than exactly one entry | `Error: Expected result to contain one single entry, but got …` |
 *
 * @returns the rates for a single day, carrying every currency in
 * {@link currencies}.
 */
export async function fetch(): Promise<IExchangeRateResult> {
  const result = await get(`${baseUrl}/eurofxref-daily.xml`);
  const rates = parse(result);
  const [first] = rates;
  // `first` is checked as well as the length, because indexed access is not
  // narrowed by the length check under `noUncheckedIndexedAccess`
  if (rates.length !== 1 || !first) {
    throw new Error(`Expected result to contain one single entry, but got ${rates.length}`);
  }
  // The daily feed always carries the full current set, so this is the one path
  // that can promise every currency; the historic feeds cannot.
  return first as IExchangeRateResult;
}

/**
 * Retrieves the complete history of reference rates, back to 1999-01-04. That
 * is over 7,000 entries and a few megabytes of XML, so prefer
 * {@link fetchHistoric90d} unless the whole series is needed.
 *
 * Rejects exactly as {@link fetch} does, minus the single-entry check.
 *
 * @returns one entry per published day, newest first. Rates are optional:
 * which currencies an entry carries depends on its date.
 */
export async function fetchHistoric(): Promise<IHistoricExchangeRateResult[]> {
  return parse(await get(`${baseUrl}/eurofxref-hist.xml`));
}

/**
 * Retrieves the reference rates of the last 90 days.
 *
 * Rejects exactly as {@link fetch} does, minus the single-entry check.
 *
 * @returns one entry per published day, newest first. Rates are optional
 * because the type is shared with {@link fetchHistoric}; in practice a
 * 90-day window carries the same currencies throughout, except across a
 * change to {@link currencies}, which it keeps reporting for 90 days after.
 */
export async function fetchHistoric90d(): Promise<IHistoricExchangeRateResult[]> {
  return parse(await get(`${baseUrl}/eurofxref-hist-90d.xml`));
}

async function get(url: string): Promise<string> {
  // Qualified because this module's own exported `fetch` shadows the global one
  // here -- a bare `fetch(url)` would recurse into it. See #65.
  const result = await globalThis.fetch(url);
  // `globalThis.fetch` rejects only when the request never completes; an error
  // status resolves normally, and the ECB answers one with an HTML page. Left
  // unchecked that page reaches `parse`, which fails with a bare
  // `TypeError: Cannot read properties of undefined (reading '0')` -- true, and
  // useless to whoever has to work out that the service was down.
  if (!result.ok) {
    throw new Error(`Request to ${url} failed with status ${result.status} ${result.statusText}`);
  }
  return await result.text();
}

/**
 * Parses the XML of any of the three ECB feeds. Exported for callers that
 * fetch the XML themselves -- through a proxy, or from a cache.
 *
 * @param string the raw XML body.
 * @throws `Error` if the body is not one of the ECB feeds, or if an entry is
 * missing its date, currency or rate. Note it is thrown, not returned: there
 * is no error result to inspect.
 */
export function parse(string: string): IHistoricExchangeRateResult[] {
  const data = new XMLParser({ ignoreAttributes: false, isArray: () => true }).parse(string);
  const result: IHistoricExchangeRateResult[] = [];
  // Optional chaining, or the guard below is unreachable: for any payload that
  // is not the ECB feed, `data['gesmes:Envelope']` is `undefined` and indexing
  // it throws a TypeError before the check runs.
  const entries = data['gesmes:Envelope']?.[0]?.['Cube']?.[0]?.['Cube'];
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
