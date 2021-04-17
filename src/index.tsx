import React, {
  Component,
  useState,
  useCallback,
  ComponentLifecycle,
  FC,
  ReactNode,
} from "react";

interface ErrorBoundaryPublicProps {
  fallback?: ReactNode;
}

interface ErrorBoundaryPrivateProps {
  error: unknown;
  onError: NonNullable<ComponentDidCatch>;
}

// eslint-disable-next-line @typescript-eslint/ban-types
type ComponentDidCatch = ComponentLifecycle<{}, {}>["componentDidCatch"];

interface ErrorBoundaryProps
  extends ErrorBoundaryPublicProps,
    ErrorBoundaryPrivateProps {}

class ErrorBoundary extends Component<ErrorBoundaryProps> {
  displayName = "ReactUseErrorBoundary";

  componentDidCatch(...args: Parameters<NonNullable<ComponentDidCatch>>) {
    this.props.onError(...args);
  }

  render() {
    if (this.props.error) {
      return this.props.fallback ?? null;
    }
    return this.props.children;
  }
}

type UseErrorBoundaryReturn = [
  FC<ErrorBoundaryPublicProps>,
  boolean,
  () => void
];

export function useErrorBoundary(
  componentDidCatch?: ComponentDidCatch
): UseErrorBoundaryReturn {
  const [error, setError] = useState(false);
  const resetError = useCallback(() => setError(false), []);
  const errorBoundary = useCallback(
    (props: ErrorBoundaryPublicProps) => (
      <ErrorBoundary
        {...props}
        error={error}
        onError={(...args) => {
          setError(true);
          componentDidCatch?.(...args);
        }}
      />
    ),
    [componentDidCatch, error]
  );
  return [errorBoundary, error, resetError];
}
