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

interface ErrorBoundaryProps {
  error: unknown;
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
  error: boolean;
  setError: (error: boolean) => void;
}

const errorBoundaryContext = createContext<ErrorBoundaryCtx>({
  componentDidCatch: { current: undefined },
  error: false,
  setError: noop,
});

export const ErrorBoundaryContext: FC = ({ children }) => {
  const [error, setError] = useState(false);
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
        onError={(...args) => {
          setError(true);
          componentDidCatch.current?.(...args);
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

type UseErrorBoundaryReturn = [error: boolean, resetError: () => void];

export function useErrorBoundary(
  componentDidCatch?: ComponentDidCatch
): UseErrorBoundaryReturn {
  const ctx = useContext(errorBoundaryContext);
  ctx.componentDidCatch.current = componentDidCatch;
  const resetError = useCallback(() => {
    ctx.setError(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return [ctx.error, resetError];
}
