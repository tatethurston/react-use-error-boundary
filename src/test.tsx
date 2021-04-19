import React, { FC, useState, useEffect } from "react";
import { useErrorBoundary, withErrorBoundary } from ".";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// suppress error boundary console errors in test output
jest.spyOn(global.console, "error").mockImplementation();

const ThrowError: FC = () => {
  throw new Error("Bombs away 💣");
};

const HappyPath: FC = () => <div>Happy Path</div>;

describe(useErrorBoundary, () => {
  it("invokes the componentDidCatch handler when there is an error", () => {
    const componentDidCatch = jest.fn();

    const Example: FC = withErrorBoundary(() => {
      const [error] = useErrorBoundary(componentDidCatch);
      if (error) {
        return null;
      }

      return <ThrowError />;
    });

    render(<Example />);

    expect(componentDidCatch).toHaveBeenCalledTimes(1);
  });

  it("does not invoke the componentDidCatch handler when there is not an error", () => {
    const componentDidCatch = jest.fn();

    const Example: FC = withErrorBoundary(() => {
      const [error] = useErrorBoundary(componentDidCatch);
      if (error) {
        return null;
      }

      return <HappyPath />;
    });

    render(<Example />);

    expect(componentDidCatch).toHaveBeenCalledTimes(0);
  });

  const Example: FC = withErrorBoundary(() => {
    const [shouldThrow, setShouldThrow] = useState(true);
    const [error, resetError] = useErrorBoundary(() => {
      setShouldThrow(false);
      console.log("componentDidCatch called??");
    });
    console.log({ error, shouldThrow });

    useEffect(() => {
      console.log("MOUNT");
    }, []);

    if (error) {
      return (
        <>
          <div>Error</div>
          <button onClick={resetError}>Reset Error</button>
        </>
      );
    }

    return (
      <>
        {shouldThrow && <ThrowError />}
        <HappyPath />
      </>
    );
  });

  it.only("invoking resetError handler resets the error state", () => {
    render(<Example />);

    expect(screen.queryByText("Error")).not.toBeNull();
    expect(screen.queryByText("Happy Path")).toBeNull();

    userEvent.click(screen.getByText("Reset Error"));

    expect(screen.queryByText("Error")).toBeNull();
    expect(screen.queryByText("Happy Path")).not.toBeNull();
  });
});
