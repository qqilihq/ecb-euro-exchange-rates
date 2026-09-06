// Preloaded into the CLI's process with `--require` so that its `fetch` fails,
// which is the only way to reach the error path of a separate process.
//
// Deliberately a `.ts` module rather than a `.cjs` script: in a plain CJS file
// `globalThis.fetch = …` reads as a global augmentation, and TypeScript then
// retypes `fetch` as returning `never` for the whole program -- which made
// `lib/index.ts` fail to compile on `result.ok`. Inside a module it is only an
// assignment, and the global keeps its declared type.
globalThis.fetch = () => Promise.reject(new TypeError('fetch failed'));
