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
 * Wrapper that is instantiated for thrown primitives so that consumers always work with the `Error` interface.
 * The thrown primitive can be accessed via the `originalData` property.
 */
export class WrappedError extends Error {
  /**
   * A reference to the original data passed to the error constructor,
   * before being stringified into the error message.
   */
  originalData: unknown;

  constructor(error: unknown) {

  console.warn("react-use-error-boundary: A value was thrown that is not an instance of Error. Thrown values should be instantiated with JavaScript's Error constructor.");
    /*
      Some values cannot be converted into a string, such as Symbols
      or certain Object instances (e.g., `Object.create(null)`).

      This try/catch ensures that our silent error wrapper doesn't
      cause an unexpected error for the user, bricking the React app
      when we're meant to be preventing errors doing so.
    */
    try {
      super(error);
    } catch {
      super("react-use-error-boundary: Could not instantiate an Error with the thrown value. The thrown value may can be accessed via the originalError property");
    }
    this.name = "WrappedError";
    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, WrappedError)
    }
    // Save a copy of the original non-stringified data
    this.originalError = error;
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
