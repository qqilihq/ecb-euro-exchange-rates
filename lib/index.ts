import * as request from 'request-promise';
import * as xml2js from 'xml2js';

export interface IExchangeRateResult {
  time: string;
  rates: { [currency: string]: number };
}

// http://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/index.en.html

export async function fetch (): Promise<IExchangeRateResult> {

  const result = await request('http://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml').promise();

  return new Promise<IExchangeRateResult>((resolve, reject) => {

    xml2js.parseString(result, (err, data) => {
      if (err) return reject(err);

      const time = data['gesmes:Envelope']['Cube'][0]['Cube'][0]['$']['time'];

      const rates: { [currency: string]: number } = {};
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
