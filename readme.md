# Euro Exchange Rates by ECB

[![Run Status](https://api.shippable.com/projects/5b24232abf766d0700896479/badge?branch=master)](https://app.shippable.com/github/qqilihq/ecb-euro-exchange-rates)
[![Coverage Badge](https://api.shippable.com/projects/5b24232abf766d0700896479/coverageBadge?branch=master)](https://app.shippable.com/github/qqilihq/ecb-euro-exchange-rates)
[![npm version](https://badge.fury.io/js/ecb-euro-exchange-rates.svg)](https://badge.fury.io/js/ecb-euro-exchange-rates)

Retrieve Euro foreign exchange reference rates from an [API](http://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/index.en.html) provided by the European Central Bank.

The API provides exchange rates updated daily for the following currencies:

* **USD**: US dollar
* **JPY**: Japanese yen
* **BGN**: Bulgarian lev
* **CZK**: Czech koruna
* **DKK**: Danish krone
* **GBP**: Pound sterling
* **HUF**: Hungarian forint
* **PLN**: Polish zloty
* **RON**: Romanian leu
* **SEK**: Swedish krona
* **CHF**: Swiss franc
* **ISK**: Icelandic krona
* **NOK**: Norwegian krone
* **HRK**: Croatian kuna
* **RUB**: Russian rouble
* **TRY**: Turkish lira
* **AUD**: Australian dollar
* **BRL**: Brazilian real
* **CAD**: Canadian dollar
* **CNY**: Chinese yuan renminbi
* **HKD**: Hong Kong dollar
* **IDR**: Indonesian rupiah
* **ILS**: Israeli shekel
* **INR**: Indian rupee
* **KRW**: South Korean won
* **MXN**: Mexican peso
* **MYR**: Malaysian ringgit
* **NZD**: New Zealand dollar
* **PHP**: Philippine piso
* **SGD**: Singapore dollar
* **THB**: Thai baht
* **ZAR**: South African rand

## Installation

```
$ yarn add ecb-euro-exchange-rates
```

## Usage

TS typings are available and you’ll get auto-completion for the supported currencies.

```
import * as exchangeRates from 'ecb-euro-exchange-rates';

const result = await exchangeRates.fetch();
console.log('Last update: ' + result.time);
console.log('USD: ' + result.rates.USD);
```

Historic rates are available via `fetchHistoric90d` (fetches previous 90 days) and `fetchHistoric` (fetches **all** rates back to 1999).

## Development

Install NPM dependencies with `yarn`.

To execute the tests, run `yarn test`.

For the best development experience, make sure that your editor supports [TSLint](https://palantir.github.io/tslint/usage/third-party-tools/) and [EditorConfig](http://editorconfig.org).

## Releasing to NPM

Commit all changes and run the following:

```
$ npm login
$ npm version <update_type>
$ npm publish
```

… where `<update_type>` is one of `patch`, `minor`, or `major`. This will update the `package.json`, and create a tagged Git commit with the version number.

## Contributing

Pull requests are very welcome. Feel free to discuss bugs or new features by opening a new [issue](https://github.com/qqilihq/ecb-euro-exchange-rates/issues).


- - -

Copyright Philipp Katz, [LineUpr GmbH](http://lineupr.com), 2018
