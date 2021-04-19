import React, { FC, useEffect } from "react";
import { withErrorBoundary, useErrorBoundary } from "react-use-error-boundary";
import { render } from "react-dom";

const HappyPath: FC = () => <div>Happy Path</div>;

const App: FC = () => {
  const [error, resetError] = useErrorBoundary(() => {
    console.info("componentDidCatch handler called");
  });

  useEffect(() => {
    console.log("error fake");
    // throw new Error("Bombs away 💣");
  }, []);

  if (error) {
    return (
      <>
        <div>Error</div>
        <button onClick={resetError}>Reset Error</button>
      </>
    );
  }

  return <HappyPath />;
};

render(<App />, document.getElementById("app"));
