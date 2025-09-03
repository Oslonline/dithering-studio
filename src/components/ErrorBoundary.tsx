import React from 'react';

interface State { hasError: boolean; message?: string; }

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  state: State = { hasError: false };
  static getDerivedStateFromError(err: unknown): State { return { hasError: true, message: (err as any)?.message || 'Unexpected error' }; }
  componentDidCatch(err: any, info: any) { console.error('[ErrorBoundary]', err, info); }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 text-center text-sm text-red-300 font-mono">
          <p>{this.state.message || 'Something went wrong.'}</p>
          <button className="clean-btn mt-4 text-[11px]" onClick={()=> location.reload()}>Reload</button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
