import { Component } from 'react';
import { AlertTriangle, Home } from 'lucide-react';

/**
 * Error Boundary Component
 * Catches React component errors and displays a fallback UI
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  reset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleGoHome = () => {
    this.reset();
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4">
          <div className="border border-red-900/30 bg-red-950/10 rounded-lg p-8 max-w-md w-full">
            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-full bg-red-900/20 flex items-center justify-center">
                <AlertTriangle size={32} className="text-red-500" />
              </div>
            </div>

            {/* Error Message */}
            <h1 className="text-2xl font-bold text-red-400 text-center mb-2">
              Oops! Something went wrong
            </h1>
            <p className="text-gray-400 text-center mb-6">
              An unexpected error occurred. Please try again or contact support if the problem persists.
            </p>

            {/* Error Details (Development Only) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mb-6 p-4 bg-neutral-900 rounded border border-gray-700 text-xs">
                <summary className="cursor-pointer text-gray-400 hover:text-gray-300 font-mono">
                  Error Details
                </summary>
                <div className="mt-3 text-red-400 font-mono whitespace-pre-wrap break-words">
                  {this.state.error.toString()}
                </div>
                {this.state.errorInfo && (
                  <div className="mt-3 text-gray-400 font-mono whitespace-pre-wrap break-words">
                    {this.state.errorInfo.componentStack}
                  </div>
                )}
              </details>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={this.reset}
                className="flex-1 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-gray-300 rounded font-medium transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={this.handleGoHome}
                className="flex-1 px-4 py-2 bg-[#00C2FF]/10 hover:bg-[#00C2FF]/20 text-[#00C2FF] rounded font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Home size={16} />
                Go Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
