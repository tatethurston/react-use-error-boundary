import React, { FC, useState } from "react";
import { useErrorBoundary } from ".";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// suppress error boundary warnings
jest.spyOn(global.console, "error").mockImplementation();

const ThrowError: FC = () => {
  throw new Error("Bombs away 💣");
};

const HappyPath: FC = () => <div>Happy Path</div>;

const Fallback: FC = () => <div>Fallback</div>;

describe(useErrorBoundary, () => {
  it("invokes the componentDidCatch handler when there is an error", () => {
    const componentDidCatch = jest.fn();

    const Example: FC = () => {
      const [ErrorBoundary] = useErrorBoundary(componentDidCatch);

      return (
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );
    };
    render(<Example />);

    expect(componentDidCatch).toHaveBeenCalledTimes(1);
  });

  it("renders the fallback when there is an error", () => {
    const Example: FC = () => {
      const [ErrorBoundary] = useErrorBoundary();

      return (
        <ErrorBoundary fallback={<Fallback />}>
          <ThrowError />
          <HappyPath />
        </ErrorBoundary>
      );
    };
    render(<Example />);

    expect(screen.queryByText("Fallback")).not.toBeNull();
    expect(screen.queryByText("Happy Path")).toBeNull();
  });

  it("empty renders when fallback is not provided and there is an error", () => {
    const Example: FC = () => {
      const [ErrorBoundary] = useErrorBoundary();

      return (
        <ErrorBoundary>
          <ThrowError />
          <HappyPath />
        </ErrorBoundary>
      );
    };
    render(<Example />);

    expect(screen.queryByText("Happy Path")).toBeNull();
  });

  it("does not invoke the componentDidCatch handler when there is not an error", () => {
    const componentDidCatch = jest.fn();

    const Example: FC = () => {
      const [ErrorBoundary] = useErrorBoundary(componentDidCatch);

      return (
        <ErrorBoundary>
          <HappyPath />
        </ErrorBoundary>
      );
    };
    render(<Example />);

    expect(componentDidCatch).toHaveBeenCalledTimes(0);
  });

  it("renders children when there is not an error", () => {
    const componentDidCatch = jest.fn();

    const Example: FC = () => {
      const [ErrorBoundary] = useErrorBoundary(componentDidCatch);

      return (
        <ErrorBoundary fallback={Fallback}>
          <HappyPath />
        </ErrorBoundary>
      );
    };
    render(<Example />);

    expect(screen.queryByText("Fallback")).toBeNull();
    expect(screen.queryByText("Happy Path")).not.toBeNull();
  });

  it("resetErrors", () => {
    const Example: FC = () => {
      const [shouldThrow, setShouldThrow] = useState(true);
      const [ErrorBoundary, error, resetError] = useErrorBoundary(() =>
        setShouldThrow(false)
      );

      return (
        <>
          {error && <div>Error</div>}
          <button onClick={resetError}>Reset Error</button>
          <ErrorBoundary>
            {shouldThrow && <ThrowError />}
            <HappyPath />
          </ErrorBoundary>
        </>
      );
    };
    render(<Example />);

    expect(screen.queryByText("Error")).not.toBeNull();
    expect(screen.queryByText("Happy Path")).toBeNull();

    userEvent.click(screen.getByText("Reset Error"));

    expect(screen.queryByText("Error")).toBeNull();
    expect(screen.queryByText("Happy Path")).not.toBeNull();
  });
});
