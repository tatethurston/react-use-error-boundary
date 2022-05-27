# Changelog

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
