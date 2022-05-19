import React, { FC, useState } from "react";
import { withErrorBoundary, useErrorBoundary } from "react-use-error-boundary";
import { render } from "react-dom";

const ThrowError: FC = () => {
  throw new Error("Bombs away 💣");
};

const App: FC = withErrorBoundary(() => {
  const [shouldThrow, setShouldThrow] = useState(false);
  const [error, resetError] = useErrorBoundary((error, errorInfo) => {
    console.info("componentDidCatch handler called");
    console.error(error);
    console.error(errorInfo);
  });

  if (error) {
    return (
      <>
        <div>Error: {error.message}</div>
        <button
          onClick={() => {
            setShouldThrow(false);
            resetError();
          }}
        >
          Reset Error
        </button>
      </>
    );
  }

  return (
    <>
      <div>Happy Path</div>
      {shouldThrow && <ThrowError />}
      <button
        onClick={() => {
          setShouldThrow(true);
        }}
      >
        Throw Error
      </button>
    </>
  );
});

render(<App />, document.getElementById("app"));
