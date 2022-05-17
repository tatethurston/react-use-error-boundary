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
  ErrorInfo,
} from "react";

// eslint-disable-next-line @typescript-eslint/ban-types
type ComponentDidCatch = ComponentLifecycle<{}, {}>["componentDidCatch"];

type ErrorType = ErrorData | undefined;

interface ErrorData {
  error: unknown;
  errorInfo: ErrorInfo;
}

interface ErrorBoundaryProps {
  error: ErrorType;
  onError: NonNullable<ComponentDidCatch>;
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
        onError={(error, errorInfo) => {
          setError({ error, errorInfo });
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
