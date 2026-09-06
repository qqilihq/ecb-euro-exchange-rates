# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- A command line entry point: `npx ecb-euro-exchange-rates` prints the current daily rates as JSON. The code existed but was reachable only by running the package's main file by path

### Fixed

- Report the HTTP status when the ECB answers a request with an error. `fetch`, `fetchHistoric` and `fetchHistoric90d` previously passed the error page on to the parser and rejected with `TypeError: Cannot read properties of undefined (reading '0')`; they now reject with `Error: Request to … failed with status 503 Service Unavailable`
- `parse` now rejects a body that is not the ECB feed with `Error: Result data does not have the expected structure`, the message it always intended. That check was unreachable — indexing the missing envelope threw a `TypeError` first
- Freeze the exported `currencies` and `discontinuedCurrencies` arrays. `readonly` is erased at runtime, so a consumer could previously write to the very arrays the library reads, changing what every other caller in the process saw

## [6.0.0] – 2026-09-05

### Added

- Export `currencies`, the list of supported currency codes, and the `Currency` type derived from it
- Export `discontinuedCurrencies` and the `HistoricCurrency` type, covering codes that occur only in the historic feeds

### Removed

- Remove HRK and RUB from the daily response typing `IExchangeRates` — the ECB no longer publishes either (Croatia joined the euro area on 1 January 2023, and RUB reference rates were suspended in March 2022). Both remain available on historic results, which still return them for past dates.

### Changed

- `fetchHistoric`, `fetchHistoric90d` and `parse` now return `IHistoricExchangeRateResult`, whose rates are optional — which currencies a historic entry carries depends on its date
- `IExchangeRates` is now a type alias derived from `currencies` rather than an interface, so it can no longer be extended through declaration merging
- Require NodeJS 22

## [5.0.0] – 2026-01-24

### Removed

- Remove BGN from response typing (API does not longer provide this, as [Bulgaria joined euro area on 1 January 2026](https://www.ecb.europa.eu/press/pr/date/2025/html/ecb.pr250708~b9676a9fa8.en.html))

## [4.0.1] – 2025-10-09

### Fixed

- Use https: URL for endpoints everywhere

### Changed

- Replace Jest with Node.js’ test runner (development)
- Upgrade fast-xml-parser to 5.3.0

## [4.0.0] - 2024-02-01

### Changed

- Require NodeJS 18
- Use native `fetch` instead of axios library

### Fixed

- Update dependencies

## [3.0.0] – 2023-04-08

### Changed

- Require NodeJS 14
- Replace `xml2js` with `fast-xml-parser`
- Update dependencies and devDependencies

## [2.0.2] – 2022-07-14

### Fixed

- Update dependencies

## [2.0.1] – 2021-09-18

### Fixed

- Update dependencies

## [2.0.0] – 2020-03-31

### Changed

- Require NodeJS 10

## [1.1.1] - 2018-10-26

### Fixed

- Fixes previous release, which didn’t contain the built files

## [1.1.0] - 2018-10-26

### Added

- This CHANGELOG file
- Allow querying for historical data using `fetchHistoric` and `fetchHistoric90d`

[unreleased]: https://github.com/qqilihq/ecb-euro-exchange-rates/compare/v6.0.0...HEAD
[6.0.0]: https://github.com/qqilihq/ecb-euro-exchange-rates/compare/v5.0.0...v6.0.0
[5.0.0]: https://github.com/qqilihq/ecb-euro-exchange-rates/compare/v4.0.1...v5.0.0
[4.0.1]: https://github.com/qqilihq/ecb-euro-exchange-rates/compare/v4.0.0...v4.0.1
[4.0.0]: https://github.com/qqilihq/ecb-euro-exchange-rates/compare/v3.0.0...v4.0.0
[3.0.0]: https://github.com/qqilihq/ecb-euro-exchange-rates/compare/v2.0.2...v3.0.0
[2.0.2]: https://github.com/qqilihq/ecb-euro-exchange-rates/compare/v2.0.1...v2.0.2
[2.0.1]: https://github.com/qqilihq/ecb-euro-exchange-rates/compare/v2.0.0...v2.0.1
[2.0.0]: https://github.com/qqilihq/ecb-euro-exchange-rates/compare/v1.1.1...v2.0.0
[1.1.1]: https://github.com/qqilihq/ecb-euro-exchange-rates/compare/v1.1.0...v1.1.1
[1.1.0]: https://github.com/qqilihq/ecb-euro-exchange-rates/compare/v1.0.1...v1.1.0
