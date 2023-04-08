import axios from 'axios';
import { XMLParser } from 'fast-xml-parser';

export interface IExchangeRates {
  USD: number;
  JPY: number;
  BGN: number;
  CZK: number;
  DKK: number;
  GBP: number;
  HUF: number;
  PLN: number;
  RON: number;
  SEK: number;
  CHF: number;
  ISK: number;
  NOK: number;
  HRK: number;
  RUB: number;
  TRY: number;
  AUD: number;
  BRL: number;
  CAD: number;
  CNY: number;
  HKD: number;
  IDR: number;
  ILS: number;
  INR: number;
  KRW: number;
  MXN: number;
  MYR: number;
  NZD: number;
  PHP: number;
  SGD: number;
  THB: number;
  ZAR: number;
}

export interface IExchangeRateResult {
  time: string;
  rates: IExchangeRates;
}

// http://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/index.en.html

export async function fetch(): Promise<IExchangeRateResult> {
  const result = await get('http://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml');
  const rates = parse(result);
  if (rates.length !== 1) {
    throw new Error(`Expected result to contain one single entry, but got ${rates.length}`);
  }
  return rates[0];
}

export async function fetchHistoric(): Promise<IExchangeRateResult[]> {
  return parse(await get('https://www.ecb.europa.eu/stats/eurofxref/eurofxref-hist.xml'));
}

export async function fetchHistoric90d(): Promise<IExchangeRateResult[]> {
  return parse(await get('https://www.ecb.europa.eu/stats/eurofxref/eurofxref-hist-90d.xml'));
}

async function get(url: string): Promise<string> {
  const result = await axios.get<string>(url);
  return result.data;
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
  })().catch(() => process.exit(1));
}
