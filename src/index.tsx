import React, {
  Component,
  useState,
  useCallback,
  ComponentLifecycle,
  FC,
  createContext,
  useContext,
  MutableRefObject,
  useMemo,
  useRef,
  ComponentType,
} from "react";

// eslint-disable-next-line @typescript-eslint/ban-types
type ComponentDidCatch = ComponentLifecycle<{}, {}>["componentDidCatch"];

type ErrorType = WrappedError | Error | undefined;

interface ErrorBoundaryProps {
  error: ErrorType;
  onError: NonNullable<ComponentDidCatch>;
}

/**
 * Wrapper around the `Error` class to allow us to create an error
 * message while retaining the originally thrown data as an attribute
 * on the class.
 */
export class WrappedError extends Error {
  /**
   * A reference to the original data passed to the error constructor,
   * before being stringified into the error message.
   */
  originalData: unknown;

  constructor(data?: unknown) {
    let stringifiedData =
      "It was not possible to parse the data thrown as a string.";

    /*
      Some values cannot be converted into a string, such as Symbols
      or certain Object instances (e.g., `Object.create(null)`).

      This try/catch ensures that our silent error wrapper doesn't
      cause an unexpected error for the user, bricking the React app
      when we're meant to be preventing errors doing so.
    */
    try {
      stringifiedData = String(data);
    } catch {
      // Ignore errors
    }

    super(stringifiedData);
    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, WrappedError)
    }
    // Save a copy of the original non-stringified data
    this.originalData = data;
  }
}

class ErrorBoundary extends Component<ErrorBoundaryProps> {
  displayName = "ReactUseErrorBoundary";

  componentDidCatch(...args: Parameters<NonNullable<ComponentDidCatch>>) {
    // silence React warning:
    // ErrorBoundary: Error boundaries should implement getDerivedStateFromError(). In that method, return a state update to display an error message or fallback UI
    this.setState({});
    this.props.onError(...args);
  }

  render() {
    return this.props.children;
  }
}

const noop = () => false;

interface ErrorBoundaryCtx {
  componentDidCatch: MutableRefObject<ComponentDidCatch>;
  error: ErrorType;
  setError: (error: ErrorType) => void;
}

const errorBoundaryContext = createContext<ErrorBoundaryCtx>({
  componentDidCatch: { current: undefined },
  error: undefined,
  setError: noop,
});

export const ErrorBoundaryContext: FC = ({ children }) => {
  const [error, setError] = useState<ErrorType>(undefined);
  const componentDidCatch = useRef<ComponentDidCatch>();
  const ctx = useMemo(
    () => ({
      componentDidCatch,
      error,
      setError,
    }),
    [error]
  );
  return (
    <errorBoundaryContext.Provider value={ctx}>
      <ErrorBoundary
        error={error}
        onError={(error: Error | WrappedError, errorInfo) => {
          if (!(error instanceof Error)) {
            error = new WrappedError(error);
          }

          setError(error);
          componentDidCatch.current?.(error, errorInfo);
        }}
      >
        {children}
      </ErrorBoundary>
    </errorBoundaryContext.Provider>
  );
};
ErrorBoundaryContext.displayName = "ReactUseErrorBoundaryContext";

export function withErrorBoundary<Props = Record<string, unknown>>(
  WrappedComponent: ComponentType<Props>
): FC<Props> {
  return (props: Props) => (
    <ErrorBoundaryContext>
      <WrappedComponent key="WrappedComponent" {...props} />
    </ErrorBoundaryContext>
  );
}

type UseErrorBoundaryReturn = [hasErrored: ErrorType, resetError: () => void];

export function useErrorBoundary(
  componentDidCatch?: ComponentDidCatch
): UseErrorBoundaryReturn {
  const ctx = useContext(errorBoundaryContext);
  ctx.componentDidCatch.current = componentDidCatch;
  const resetError = useCallback(() => {
    ctx.setError(undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return [ctx.error, resetError];
}
