// Preloaded into the CLI's process with `--require` so that its `fetch` fails,
// which is the only way to reach the error path of a separate process.
//
// Deliberately TypeScript rather than a `.cjs` script. In a JavaScript file
// TypeScript infers declarations from assignments -- that is how it supports
// CommonJS-style JS -- so `globalThis.fetch = …` there retypes `fetch` as
// returning `never` for the whole program, and `lib/index.ts` stops compiling
// on `result.ok`. In a `.ts` file the same line is only an assignment, whether
// or not the file is a module.
//
// The `export {}` is what makes it a module, and is deliberate rather than
// decoration: without it this is a global script, so any top-level binding
// added here later would land in the global scope.
export {};

globalThis.fetch = () => Promise.reject(new TypeError('fetch failed'));
