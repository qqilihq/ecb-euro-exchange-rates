import * as request from 'request-promise';
import * as xml2js from 'xml2js';

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

  return new Promise<IExchangeRateResult>((resolve, reject) => {

    xml2js.parseString(result, (err, data) => {
      if (err) return reject(err);

      const time = data['gesmes:Envelope']['Cube'][0]['Cube'][0]['$']['time'];

      const rates = {} as any;
      for (const item of data['gesmes:Envelope']['Cube'][0]['Cube'][0]['Cube']) {
        const currency = item['$']['currency'];
        const rate = parseFloat(item['$']['rate']);
        rates[currency] = rate;
      }
      resolve({ time, rates });
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
