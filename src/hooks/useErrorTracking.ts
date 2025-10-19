import { useCallback, useEffect, useRef } from 'react';

export type ErrorCategory = 
  | 'validation'
  | 'processing'
  | 'network'
  | 'memory'
  | 'feature-unsupported'
  | 'unknown';

export interface ErrorLog {
  id: string;
  timestamp: number;
  category: ErrorCategory;
  message: string;
  stack?: string;
  context?: Record<string, unknown>;
  userAgent: string;
}

export interface ErrorTrackingOptions {
  maxErrors?: number;
  reportToConsole?: boolean;
  reportCallback?: (error: ErrorLog) => void;
  ignorePatterns?: RegExp[];
}

const DEFAULT_OPTIONS: Required<ErrorTrackingOptions> = {
  maxErrors: 100,
  reportToConsole: true,
  reportCallback: () => {},
  ignorePatterns: []
};

export function useErrorTracking(options: ErrorTrackingOptions = {}) {
  const config = { ...DEFAULT_OPTIONS, ...options };
  const errorsRef = useRef<ErrorLog[]>([]);
  const errorCountRef = useRef(0);

  const categorizeError = useCallback((error: Error | string): ErrorCategory => {
    const message = typeof error === 'string' ? error : error.message;
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('validation') || lowerMessage.includes('invalid')) {
      return 'validation';
    }
    if (lowerMessage.includes('network') || lowerMessage.includes('fetch') || lowerMessage.includes('timeout')) {
      return 'network';
    }
    if (lowerMessage.includes('memory') || lowerMessage.includes('allocation') || lowerMessage.includes('out of memory')) {
      return 'memory';
    }
    if (lowerMessage.includes('not supported') || lowerMessage.includes('unavailable')) {
      return 'feature-unsupported';
    }
    if (lowerMessage.includes('dither') || lowerMessage.includes('process') || lowerMessage.includes('canvas')) {
      return 'processing';
    }

    return 'unknown';
  }, []);

  const shouldIgnoreError = useCallback((message: string): boolean => {
    return config.ignorePatterns.some(pattern => pattern.test(message));
  }, [config.ignorePatterns]);

  const trackError = useCallback((
    error: Error | string,
    context?: Record<string, unknown>
  ) => {
    const message = typeof error === 'string' ? error : error.message;
    
    if (shouldIgnoreError(message)) {
      return;
    }

    const errorLog: ErrorLog = {
      id: `${Date.now()}-${++errorCountRef.current}`,
      timestamp: Date.now(),
      category: categorizeError(error),
      message,
      stack: typeof error === 'object' ? error.stack : undefined,
      context,
      userAgent: navigator.userAgent
    };

    errorsRef.current.push(errorLog);
    
    if (errorsRef.current.length > config.maxErrors) {
      errorsRef.current.shift();
    }

    if (config.reportToConsole) {
      console.error('[Error Tracked]', {
        category: errorLog.category,
        message: errorLog.message,
        context: errorLog.context
      });
    }

    config.reportCallback(errorLog);
  }, [categorizeError, shouldIgnoreError, config]);

  const trackValidationError = useCallback((
    field: string,
    value: unknown,
    reason: string
  ) => {
    trackError(`Validation failed for ${field}: ${reason}`, {
      field,
      value,
      category: 'validation'
    });
  }, [trackError]);

  const trackProcessingError = useCallback((
    operation: string,
    details?: Record<string, unknown>
  ) => {
    trackError(`Processing error in ${operation}`, {
      operation,
      ...details,
      category: 'processing'
    });
  }, [trackError]);

  const trackFeatureUnsupported = useCallback((
    feature: string,
    fallback?: string
  ) => {
    trackError(`Feature not supported: ${feature}`, {
      feature,
      fallback,
      category: 'feature-unsupported'
    });
  }, [trackError]);

  const getErrors = useCallback((): ErrorLog[] => {
    return [...errorsRef.current];
  }, []);

  const getErrorsByCategory = useCallback((category: ErrorCategory): ErrorLog[] => {
    return errorsRef.current.filter(e => e.category === category);
  }, []);

  const getRecentErrors = useCallback((count: number = 10): ErrorLog[] => {
    return errorsRef.current.slice(-count);
  }, []);

  const clearErrors = useCallback(() => {
    errorsRef.current = [];
    errorCountRef.current = 0;
  }, []);

  const getErrorStats = useCallback(() => {
    const stats: Record<ErrorCategory, number> = {
      validation: 0,
      processing: 0,
      network: 0,
      memory: 0,
      'feature-unsupported': 0,
      unknown: 0
    };

    errorsRef.current.forEach(error => {
      stats[error.category]++;
    });

    return {
      total: errorsRef.current.length,
      byCategory: stats,
      mostRecent: errorsRef.current[errorsRef.current.length - 1],
      oldestTimestamp: errorsRef.current[0]?.timestamp
    };
  }, []);

  const exportErrors = useCallback((): string => {
    return JSON.stringify({
      exportedAt: new Date().toISOString(),
      errorCount: errorsRef.current.length,
      errors: errorsRef.current
    }, null, 2);
  }, []);

  useEffect(() => {
    const handleUnhandledError = (event: ErrorEvent) => {
      trackError(event.error || event.message, {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      });
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      trackError(
        event.reason instanceof Error ? event.reason : String(event.reason),
        { type: 'unhandled-promise-rejection' }
      );
    };

    window.addEventListener('error', handleUnhandledError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleUnhandledError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [trackError]);

  return {
    trackError,
    trackValidationError,
    trackProcessingError,
    trackFeatureUnsupported,
    getErrors,
    getErrorsByCategory,
    getRecentErrors,
    clearErrors,
    getErrorStats,
    exportErrors
  };
}
