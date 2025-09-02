import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-screen bg-earth-bg-900 text-white flex items-center justify-center">
          <div className="text-center max-w-md">
            <h1 className="text-2xl font-bold mb-4 text-red-500">
              Something went wrong
            </h1>
            <p className="text-earth-bg-300 mb-6">
              The application encountered an error. Please refresh the page to try again.
            </p>
            {this.state.error && (
              <details className="text-left bg-earth-bg-800 p-4 rounded-lg mb-4">
                <summary className="cursor-pointer text-red-400 mb-2">
                  Error Details
                </summary>
                <pre className="text-xs text-earth-bg-400 overflow-auto">
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-earth-purple-600 hover:bg-earth-purple-500 rounded-lg font-medium"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}