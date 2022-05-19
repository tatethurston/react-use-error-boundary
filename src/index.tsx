import React, {
  Component,
  useState,
  useCallback,
  ComponentLifecycle,
  createContext,
  useContext,
  MutableRefObject,
  useMemo,
  useRef,
  ComponentType,
  ReactNode,
  PropsWithChildren,
  ReactElement,
} from "react";

// eslint-disable-next-line @typescript-eslint/ban-types
type ComponentDidCatch = ComponentLifecycle<{}, {}>["componentDidCatch"];

interface ErrorBoundaryProps {
  error: Error | undefined;
  onError: NonNullable<ComponentDidCatch>;
}

/**
 * Wrapper that is instantiated for thrown primitives so that consumers always work with the `Error` interface.
 * The thrown primitive can be accessed via the `originalError` property.
 */
class ReactUseErrorBoundaryWrappedError extends Error {
  /**
   * The thrown error.
   */
  originalError: unknown;

  constructor(error: unknown) {
    console.warn(
      "react-use-error-boundary: A value was thrown that is not an instance of Error. Thrown values should be instantiated with JavaScript's Error constructor."
    );
    /*
      Some values cannot be converted into a string, such as Symbols
      or certain Object instances (e.g., `Object.create(null)`).

      This try/catch ensures that our silent error wrapper doesn't
      cause an unexpected error for the user, bricking the React app
      when we're meant to be preventing errors doing so.
    */
    try {
      super(error as string);
    } catch {
      super(
        "react-use-error-boundary: Could not instantiate an Error with the thrown value. The thrown value can be accessed via the 'originalError' property"
      );
    }
    this.name = "ReactUseErrorBoundaryWrappedError";
    // Maintains proper stack trace for where our error was thrown (only available on V8)
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    Error.captureStackTrace?.(this, ReactUseErrorBoundaryWrappedError);
    // Save a copy of the original non-stringified data
    this.originalError = error;
  }
}

class ErrorBoundary extends Component<PropsWithChildren<ErrorBoundaryProps>> {
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
  error: Error | undefined;
  setError: (error: Error | undefined) => void;
}

const errorBoundaryContext = createContext<ErrorBoundaryCtx>({
  componentDidCatch: { current: undefined },
  error: undefined,
  setError: noop,
});

// eslint-disable-next-line @typescript-eslint/ban-types
export function ErrorBoundaryContext({
  children,
}: {
  children?: ReactNode | undefined;
}) {
  const [error, setError] = useState<Error>();
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
        onError={(error, errorInfo) => {
          if (!(error instanceof Error)) {
            error = new ReactUseErrorBoundaryWrappedError(error);
          }

          setError(error);
          componentDidCatch.current?.(error, errorInfo);
        }}
      >
        {children}
      </ErrorBoundary>
    </errorBoundaryContext.Provider>
  );
}
ErrorBoundaryContext.displayName = "ReactUseErrorBoundaryContext";

export function withErrorBoundary<Props = Record<string, unknown>>(
  WrappedComponent: ComponentType<Props>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): (props: PropsWithChildren<Props>) => ReactElement<any, any> {
  return (props: Props) => (
    <ErrorBoundaryContext>
      <WrappedComponent key="WrappedComponent" {...props} />
    </ErrorBoundaryContext>
  );
}

type UseErrorBoundaryReturn = [
  error: Error | undefined,
  resetError: () => void
];

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
