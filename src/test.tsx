import React, { FC, useState } from "react";
import { useErrorBoundary, withErrorBoundary } from ".";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// suppress error boundary console errors in test output
jest.spyOn(global.console, "error").mockImplementation();
jest.spyOn(global.console, "warn").mockImplementation();

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

  it("wraps thrown values that are not Error instances with ReactUseErrorBoundaryWrappedError", () => {
    const thrownError = "Bombs away 💣";

    const ThrowNonError: FC = () => {
      throw thrownError;
    };

    let error;

    const Example: FC = withErrorBoundary(() => {
      [error] = useErrorBoundary();
      if (error) {
        return <p>Error: {error.message}</p>;
      }

      return <ThrowNonError />;
    });

    render(<Example />);

    expect(screen.queryByText(/Error:/)).toMatchInlineSnapshot(`
      <p>
        Error: 
        Bombs away 💣
      </p>
    `);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
    expect((error as any).originalError).toEqual(thrownError);
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

  it("invoking resetError handler resets the error state", async () => {
    const Example: FC = withErrorBoundary(() => {
      const [shouldThrow, setShouldThrow] = useState(false);
      const [error, resetError] = useErrorBoundary();

      if (error) {
        return (
          <>
            <div>Error</div>
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

    render(<Example />);
    expect(screen.queryByText("Happy Path")).not.toBeNull();
    expect(screen.queryByText("Error")).toBeNull();

    await userEvent.click(screen.getByText("Throw Error"));

    expect(screen.queryByText("Happy Path")).toBeNull();
    expect(screen.queryByText("Error")).not.toBeNull();

    await userEvent.click(screen.getByText("Reset Error"));

    expect(screen.queryByText("Happy Path")).not.toBeNull();
    expect(screen.queryByText("Error")).toBeNull();
  });
});
