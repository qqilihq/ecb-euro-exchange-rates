import expect = require('expect.js');
import * as ecb from '../lib/index';

describe('ECP exchange rates', () => {

  describe('retrieve exchange rates', () => {

    it('retrieves exchange rates', async () => {
      const result = await ecb.fetch();
      expect(result).to.be.an('object');
      expect(result.time).to.be.a('string');
      expect(result.rates).to.be.an('object');
      expect(result.rates.USD).to.be.a('number');
    });

  });

});
