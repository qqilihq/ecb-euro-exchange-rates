import expect = require('expect.js');
import * as exchangeRates from '../lib/index';

describe('ECB exchange rates', function () {

  // retrieving the history takes a bit of time
  this.timeout(60 * 1000 /* 60 seconds */);

  describe('retrieve exchange rates', function () {

    it('retrieves exchange rates', async () => {
      const result = await exchangeRates.fetch();
      expect(result).to.be.an('object');
      expect(result.time).to.be.a('string');
      expect(result.rates).to.be.an('object');
      expect(result.rates.USD).to.be.a('number');
    });

    it('retrieves historic exchange rates', async () => {
      const result = await exchangeRates.fetchHistoric90d();
      expect(result).to.be.an('array');
      expect(result.length).to.be.greaterThan(50);
      expect(result[0]).to.be.an('object');
      expect(result[0].time).to.be.a('string');
      expect(result[0].rates).to.be.an('object');
      expect(result[0].rates.USD).to.be.a('number');
    });

    it('retrieves all historic exchange rates', async () => {
      const result = await exchangeRates.fetchHistoric();
      expect(result).to.be.an('array');
      expect(result.length).to.be.greaterThan(5000);
      expect(result[0]).to.be.an('object');
      expect(result[0].time).to.be.a('string');
      expect(result[0].rates).to.be.an('object');
      expect(result[0].rates.USD).to.be.a('number');
      expect(result[result.length - 1].time).to.eql('1999-01-04');
    });

  });

});
