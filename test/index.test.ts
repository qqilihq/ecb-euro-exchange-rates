import * as exchangeRates from '../lib/index';
import 'jest-extended';

describe('ECB exchange rates', () => {
  // retrieving the history takes a bit of time
  jest.setTimeout(60 * 1000 /* 60 seconds */);

  describe('retrieve exchange rates', function () {
    it('retrieves exchange rates', async () => {
      const result = await exchangeRates.fetch();
      expect(result).toBeObject();
      expect(result.time).toBeString();
      expect(result.rates).toBeObject();
      expect(result.rates.USD).toBeNumber();
    });

    it('retrieves historic exchange rates', async () => {
      const result = await exchangeRates.fetchHistoric90d();
      expect(result).toBeArray();
      expect(result.length).toBeGreaterThan(50);
      expect(result[0]).toBeObject();
      expect(result[0].time).toBeString();
      expect(result[0].rates).toBeObject();
      expect(result[0].rates.USD).toBeNumber();
    });

    it('retrieves all historic exchange rates', async () => {
      const result = await exchangeRates.fetchHistoric();
      expect(result).toBeArray();
      expect(result.length).toBeGreaterThan(5000);
      expect(result[0]).toBeObject();
      expect(result[0].time).toBeString();
      expect(result[0].rates).toBeObject();
      expect(result[0].rates.USD).toBeNumber();
      expect(result[result.length - 1].time).toEqual('1999-01-04');
    });
  });
});
