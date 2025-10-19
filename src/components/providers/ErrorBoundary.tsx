import React from 'react';
import { useTranslation } from 'react-i18next';

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  section?: string;
}

function ErrorFallback({ 
  error, 
  errorInfo, 
  onReset, 
  onReload,
  section
}: { 
  error?: Error; 
  errorInfo?: React.ErrorInfo;
  onReset: () => void;
  onReload: () => void;
  section?: string;
}) {
  const { t } = useTranslation();
  const [showDetails, setShowDetails] = React.useState(false);

  const getRecoverySuggestions = () => {
    const message = error?.message?.toLowerCase() || '';
    
    if (message.includes('chunk') || message.includes('loading')) {
      return [
        'The application may have been updated',
        'Try refreshing the page',
        'Clear your browser cache if the problem persists'
      ];
    }
    
    if (message.includes('memory') || message.includes('allocation')) {
      return [
        'The image or video may be too large',
        'Try using a smaller file',
        'Close other browser tabs to free up memory'
      ];
    }
    
    if (message.includes('network') || message.includes('fetch')) {
      return [
        'Check your internet connection',
        'Try again in a few moments',
        'Use the offline version if available'
      ];
    }
    
    return [
      'Try refreshing the page',
      'Clear your browser data',
      'Contact support if the issue continues'
    ];
  };

  const suggestions = getRecoverySuggestions();

  return (
    <div className="p-6 max-w-xl mx-auto text-sm">
      <div className="mb-4 p-4 bg-red-900/20 border border-red-500/30 rounded">
        <h3 className="font-bold text-red-300 mb-2">
          {section ? `Error in ${section}` : t('errors.somethingWentWrong')}
        </h3>
        <p className="text-red-200/80 text-xs mb-3">
          {error?.message || 'An unexpected error occurred'}
        </p>
        
        <div className="mb-3">
          <p className="text-xs text-gray-400 mb-2 font-semibold">Recovery suggestions:</p>
          <ul className="text-xs text-gray-300 space-y-1">
            {suggestions.map((suggestion, i) => (
              <li key={i} className="flex items-start">
                <span className="mr-2">•</span>
                <span>{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex gap-2">
          <button 
            className="clean-btn text-[11px] px-3 py-1" 
            onClick={onReset}
          >
            Try Again
          </button>
          <button 
            className="clean-btn text-[11px] px-3 py-1" 
            onClick={onReload}
          >
            {t('common.reload')}
          </button>
          <button 
            className="clean-btn text-[11px] px-3 py-1 ml-auto" 
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? 'Hide' : 'Show'} Details
          </button>
        </div>
      </div>

      {showDetails && (
        <details className="text-xs font-mono bg-gray-900/50 p-3 rounded overflow-auto max-h-64">
          <summary className="cursor-pointer text-gray-400 mb-2">Technical Details</summary>
          <div className="text-gray-500 space-y-2">
            <div>
              <strong>Error:</strong> {error?.name}
            </div>
            <div>
              <strong>Message:</strong> {error?.message}
            </div>
            {error?.stack && (
              <div>
                <strong>Stack:</strong>
                <pre className="mt-1 text-[10px] overflow-auto">{error.stack}</pre>
              </div>
            )}
            {errorInfo?.componentStack && (
              <div>
                <strong>Component Stack:</strong>
                <pre className="mt-1 text-[10px] overflow-auto">{errorInfo.componentStack}</pre>
              </div>
            )}
          </div>
        </details>
      )}
    </div>
  );
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[ErrorBoundary]', this.props.section || 'root', error, errorInfo);
    
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    this.setState({ error, errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <ErrorFallback 
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          onReset={this.handleReset}
          onReload={this.handleReload}
          section={this.props.section}
        />
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
