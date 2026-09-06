# Euro Exchange Rates by ECB

[![Actions Status](https://github.com/qqilihq/ecb-euro-exchange-rates/workflows/CI/badge.svg)](https://github.com/qqilihq/ecb-euro-exchange-rates/actions)
[![codecov](https://codecov.io/gh/qqilihq/ecb-euro-exchange-rates/branch/master/graph/badge.svg)](https://codecov.io/gh/qqilihq/ecb-euro-exchange-rates)
[![npm version](https://badge.fury.io/js/ecb-euro-exchange-rates.svg)](https://badge.fury.io/js/ecb-euro-exchange-rates)

Retrieve Euro foreign exchange reference rates from an [API](https://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/index.en.html) provided by the European Central Bank. This module is intended to run on the server via Node.js, not in the browser.

The API provides exchange rates updated daily for the following currencies:

- **USD**: US dollar
- **JPY**: Japanese yen
- **CZK**: Czech koruna
- **DKK**: Danish krone
- **GBP**: Pound sterling
- **HUF**: Hungarian forint
- **PLN**: Polish zloty
- **RON**: Romanian leu
- **SEK**: Swedish krona
- **CHF**: Swiss franc
- **ISK**: Icelandic krona
- **NOK**: Norwegian krone
- **TRY**: Turkish lira
- **AUD**: Australian dollar
- **BRL**: Brazilian real
- **CAD**: Canadian dollar
- **CNY**: Chinese yuan renminbi
- **HKD**: Hong Kong dollar
- **IDR**: Indonesian rupiah
- **ILS**: Israeli shekel
- **INR**: Indian rupee
- **KRW**: South Korean won
- **MXN**: Mexican peso
- **MYR**: Malaysian ringgit
- **NZD**: New Zealand dollar
- **PHP**: Philippine piso
- **SGD**: Singapore dollar
- **THB**: Thai baht
- **ZAR**: South African rand

## Installation

```shell
$ npm install ecb-euro-exchange-rates
```

## Usage

TS typings are available and you’ll get auto-completion for the supported currencies.

```javascript
import * as exchangeRates from 'ecb-euro-exchange-rates';

const result = await exchangeRates.fetch();
console.log('Last update: ' + result.time);
console.log('USD: ' + result.rates.USD);
```

Historic rates are available via `fetchHistoric90d` (fetches previous 90 days) and `fetchHistoric` (fetches **all** rates back to 1999).

### On the command line

The current rates are also available as a command, which prints the same result as JSON:

```shell
$ npx ecb-euro-exchange-rates
{
  "time": "2026-09-04",
  "rates": {
    "USD": 1.1622,
    …
  }
}
```

Errors go to stderr and the exit code is non-zero, so `npx ecb-euro-exchange-rates | jq '.rates.USD'` is safe to use in a pipeline.

Historic responses do not always carry the same currencies as the daily one: they may include currencies the ECB has since stopped publishing (HRK and RUB, for example), and they omit currencies that were not yet published at the time — the oldest entry, from January 1999, holds 27 rates. Their rates are therefore typed as optional, and the full set of codes that can occur is exported as `currencies` and `discontinuedCurrencies`.

## Development

Node.js and pnpm are pinned in `package.json` (`devEngines.runtime` and `packageManager`); pnpm downloads the pinned Node.js version itself, so no separate version manager is needed.

Install dependencies with `pnpm install`.

To execute the tests, run `pnpm test`. To lint, run `pnpm run lint`, which runs ESLint, Prettier, the TypeScript compiler and [Knip](https://knip.dev) in turn; each is also available on its own as `lint:eslint`, `lint:format`, `lint:types` and `lint:knip`.

The tests talk to the live ECB feeds, which is deliberate — this is a client for a remote service, so upstream downtime failing the build is information rather than flakiness. They also compare the API against the exported `currencies` list and against the list in this readme, so a currency appearing or disappearing upstream turns a test red instead of quietly shipping a wrong type.

Dependencies are updated with `pnpm outdated` and `pnpm update -i --latest`. Two of them are deliberately held back, and `pnpm outdated` will keep offering both:

- **`@types/node`** tracks the `engines.node` floor (22), not the newest release. Developing against a newer major would type-check code here against APIs that a supported consumer's runtime does not have, and the mismatch would surface at their runtime rather than in this build. It moves only when `engines.node` moves, which is a breaking change.
- **`typescript`** is pinned to `~6.0.3` rather than a caret range, because typescript-eslint declares `typescript: ">=4.8.4 <6.1.0"`. A caret range would let a lockfile refresh install a compiler that type-aware linting cannot use. Widen it once typescript-eslint supports the newer line.

For the best development experience, make sure that your editor supports [ESLint](https://eslint.org/docs/user-guide/integrations), [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) and [EditorConfig](https://editorconfig.org). `.vscode/settings.json` points the editor at the pinned compiler, so its diagnostics match `pnpm run lint:types`; in VS Code, accept _Use Workspace Version_ if prompted.

`tsconfig.json` sets `types` explicitly. TypeScript 6 no longer pulls in every installed `@types` package on its own, so without it a file using `fetch` or `path` fails to compile.

Linting of code and commit message happens on commit via [Husky](https://github.com/typicode/husky). Commit messages follow [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/); `.commitlintrc.json` lists the accepted types.

## Releasing to NPM

First promote the changelog by hand: rename `## [Unreleased]` to `## [X.Y.Z] – <date>`, repoint the `[unreleased]` link reference at the new tag, and add a comparison link for the release. Commit that on its own — the wording, grouping and date deserve review, and nothing rewrites them for you.

Then commit any remaining changes and run the following:

```shell
$ pnpm login
$ pnpm run release <update_type>
$ git push --follow-tags
$ pnpm publish
```

… where `<update_type>` is one of `patch`, `minor`, or `major` — passed positionally, not as `--patch`. This updates the `package.json` and creates a tagged Git commit.

`--follow-tags` matters: a plain `git push` leaves the version tag behind, and the changelog’s comparison links stay broken until it lands. `pnpm publish` refuses to publish a branch that is not clean and up to date, so it will catch an unpushed commit — but not an unpushed tag.

The release refuses to run unless the changelog is ready. `dev/verify-changelog.ts` checks it and never modifies it, from two lifecycle scripts: `preversion`, before the version is bumped, so the usual “forgot to promote it” case fails while the working tree is still clean; and `version`, after the bump, which is the only point at which the new version number is known and can be compared against the heading. The error message spells out what to write, with the repository URL and previous tag filled in.

A failure at the `version` stage — a changelog promoted to a different version than the one being released — aborts before any commit or tag, but leaves `package.json` bumped, since the bump happens first. Undo it with `git checkout package.json` before retrying.

Use `pnpm`, not `npm`, for these. Because the project pins its Node.js version through `devEngines.runtime`, npm refuses to run anything here (`EBADDEVENGINES`) unless the ambient Node.js version happens to match that exact version.

## Contributing

Pull requests are very welcome. Feel free to discuss bugs or new features by opening a new [issue](https://github.com/qqilihq/ecb-euro-exchange-rates/issues).

---

Copyright Philipp Katz, [LineUpr GmbH](https://lineupr.com), 2018 – 2026
