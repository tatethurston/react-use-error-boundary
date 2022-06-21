# Changelog

## v3.0.0

```js
const [error] = useErrorBoundary();
```

- The `error` wrapping that was introduced in v2 has been removed. `error` will now be the error that was caught without any wrapping for thrown primitives. The types have been updated to `unknown` to reflect that thrown JavaScript errors may be any type not just instances of `Error`.

- `withErrorBoundary` now propagates the wrapped component display name for improved debugging with React dev tools. It will display as `WithErrorBoundary(${Component.displayName})`.

## v2.0.1

Publish CommonJS and ESM.

## v2.0.0

```js
const [error] = useErrorBoundary();
```

`error` is now the error that was caught or `undefined` if nothing errored. Previously `error` was a boolean value. Providing access to the error rather
than a boolean makes it more ergonomic to render UI in response to the caught error. Special thanks to @davwheat for the contribution.

If something other than an instance of `Error` is thrown, it will be wrapped in an `Error` object by calling `new Error()` on the thrown value. A warning will log when this occurs: while you _may_ throw any value in JavaScript, you _should_ only throw instances of Error. This ensures a stack trace is collected is that all errors conform to a unified interface. This wrapping may be removed in a future v3 release of this library.

## v1.0.2

Internal: remove unnecessary files when publishing to npm registry.

## v1.0.1

Internal: fix CI publishes.

## v1.0.0

No API changes. This library will now follow [semantic versioning](https://docs.npmjs.com/about-semantic-versioning).
