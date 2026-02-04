import { Component } from 'react';
import type { ReactNode, ErrorInfo } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  navigate: (to: string, options?: { replace?: boolean; state?: any }) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

/**
 * Error Boundary component that catches JavaScript errors anywhere in the component tree
 * When an error is caught, it redirects to the error page with a 500 status code
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error to console for debugging
    console.error('Error caught by ErrorBoundary:', error, errorInfo);

    // Navigate to error page with error details
    this.props.navigate('/error', {
      replace: true,
      state: {
        code: 500,
        reason: `${error.name}: ${error.message}`,
      },
    });
  }

  componentDidUpdate(): void {
    // Reset error state after navigation
    if (this.state.hasError) {
      this.setState({ hasError: false });
    }
  }

  render(): ReactNode {
    return this.props.children;
  }
}
