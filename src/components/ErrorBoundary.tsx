import React from 'react';
import { useTranslation } from 'react-i18next';

interface State { hasError: boolean; message?: string; }

// Wrapper component to use hooks
function ErrorFallback({ message, onReload }: { message?: string; onReload: () => void }) {
  const { t } = useTranslation();
  return (
    <div className="p-6 text-center text-sm text-red-300 font-mono">
      <p>{message || t('errors.somethingWentWrong')}</p>
      <button className="clean-btn mt-4 text-[11px]" onClick={onReload}>{t('common.reload')}</button>
    </div>
  );
}

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  state: State = { hasError: false };
  static getDerivedStateFromError(err: unknown): State { return { hasError: true, message: (err as any)?.message || 'Unexpected error' }; }
  componentDidCatch(err: any, info: any) { console.error('[ErrorBoundary]', err, info); }
  render() {
    if (this.state.hasError) {
      return <ErrorFallback message={this.state.message} onReload={() => location.reload()} />;
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
