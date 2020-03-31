import request from 'request-promise';
import xml2js from 'xml2js';

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

export async function fetch (): Promise<IExchangeRateResult> {
  const result = await request('http://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml').promise();
  const rates = await parse(result);
  if (rates.length !== 1) {
    throw new Error(`Expected result to contain one single entry, but got ${rates.length}`);
  }
  return rates[0];
}

export async function fetchHistoric (): Promise<IExchangeRateResult[]> {
  return parse(await request('https://www.ecb.europa.eu/stats/eurofxref/eurofxref-hist.xml').promise());
}

export async function fetchHistoric90d (): Promise<IExchangeRateResult[]> {
  return parse(await request('https://www.ecb.europa.eu/stats/eurofxref/eurofxref-hist-90d.xml').promise());
}

function parse (result: any): Promise<IExchangeRateResult[]> {
  return new Promise<IExchangeRateResult[]>((resolve, reject) => {

    xml2js.parseString(result, (err, data) => {
      if (err) return reject(err);

      const result: IExchangeRateResult[] = [];
      const entries = data['gesmes:Envelope']['Cube'][0]['Cube'];

      for (const current of entries) {

        const time = current['$']['time'];
        const rates = {} as any;
        for (const item of current['Cube']) {
          const currency = item['$']['currency'];
          const rate = parseFloat(item['$']['rate']);
          rates[currency] = rate;
        }

        result.push({ time, rates });

      }
      resolve(result);
    });
  });

}

// CLI only when module is not require'd
if (require.main === module) {
  (async () => {
    const result = await fetch();
    console.log(JSON.stringify(result, null, 2));
  })().catch(() => { /* :O */ });
}
