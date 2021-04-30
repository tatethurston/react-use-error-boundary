# react-use-error-boundary

<blockquote>A React error boundary hook for function components</blockquote>

<br />

<a href="https://www.npmjs.com/package/react-use-error-boundary">
  <img src="https://img.shields.io/npm/v/react-use-error-boundary.svg">
</a>
<a href="https://github.com/tatethurston/react-use-error-boundary/blob/master/LICENSE">
  <img src="https://img.shields.io/npm/l/react-use-error-boundary.svg">
</a>
<a href="https://bundlephobia.com/result?p=react-use-error-boundary">
  <img src="https://img.shields.io/bundlephobia/minzip/react-use-error-boundary">
</a>
<a href="https://www.npmjs.com/package/react-use-error-boundary">
  <img src="https://img.shields.io/npm/dy/react-use-error-boundary.svg">
</a>
<a href="https://github.com/tatethurston/react-use-error-boundary/actions/workflows/ci.yml">
  <img src="https://github.com/tatethurston/react-use-error-boundary/actions/workflows/ci.yml/badge.svg">
</a>

## What is this? 🧐

React 16 introduced [Error Boundaries](https://reactjs.org/docs/error-boundaries.html). As of React 17, there still is [not an equivalent hook](https://reactjs.org/docs/hooks-faq.html#do-hooks-cover-all-use-cases-for-classes) for function components.

This library draws inspiration from Preact's [useErrorBoundary](https://preactjs.com/guide/v10/hooks/#useerrorboundary) and attempts to recreate a similar API.

## Installation & Usage 📦

1. Add this package to your project:
   - `yarn add react-use-error-boundary`

## Examples 🚀

Whenever the component or a child component throws an error you can use this hook to catch the error and display an error UI to the user.

```jsx
// error = The error that was caught or `undefined` if nothing errored.
// resetError = Call this function to mark an error as resolved. It's
//   up to your app to decide what that means and if it is possible
//   to recover from errors.
const [error, resetError] = useErrorBoundary();
```

For application monitoring, it's often useful to notify a service of any errors. `useErrorBoundary` accepts an optional callback that will be invoked when an error is encountered.

```jsx
const [error] = useErrorBoundary((error) => callMyApi(error.message));
```

A full example may look like this:

```jsx
import { withErrorBoundary, useErrorBoundary } from "react-use-error-boundary";

const App = withErrorBoundary({ children }) => {
  const [error, resetError] = useErrorBoundary(
    error => callMyApi(error.message)
  );

  if (error) {
    return (
      <div>
        <p>{error.message}</p>
        <button onClick={resetError}>Try again</button>
      </div>
    );
  }

  return <div>{children}</div>
};
```

Note that in addition to the hook, the component must be wrapped with `withErrorBoundary`. This function wraps the component with an Error Boundary and a context provider. Alternatively, the `<ErrorBoundaryContext>` component from this library may be placed in your component tree, above each component using `useErrorBoundary`.

This was done to avoid hooking into React internals, which would otherwise be required. The hope is that the eventual React hook solution will present a similar API, and users can easily migrate by removing the `withErrorBoundary` wrapper.

For a full project example take a look at the [examples directory](https://github.com/tatethurston/react-use-error-boundary/blob/main/examples).

## Known Limitations ⚠️

Because React recreates the component tree from scratch after catching an error, the component using the `useErrorBoundary` hook is always remounted after an error is encountered. This means any state will be reinitialized: `useState` and `useRef` hooks will be reinitialized to their initial value and will _not_ persist across caught errors. Any values that need to be preserved across error catching must be lifted into a parent component above the component wrapped in `withErrorBoundary`.

## Highlights

🎁 Zero run time dependencies

🪐 Isomorphic / Universal -- safe to run in any JS context: the browser or on a server

🦶 Small footprint [673 B minified and gzipped](https://bundlephobia.com/result?p=react-use-error-boundary@0.0.5)

## Contributing 👫

PR's and issues welcomed! For more guidance check out [CONTRIBUTING.md](https://github.com/tatethurston/react-use-error-boundary/blob/master/CONTRIBUTING.md)

## Licensing 📃

See the project's [MIT License](https://github.com/tatethurston/react-use-error-boundary/blob/master/LICENSE).
