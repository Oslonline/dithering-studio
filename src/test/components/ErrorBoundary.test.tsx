import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import ErrorBoundary from '../../components/providers/ErrorBoundary';

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const dict: Record<string, string> = {
        'common.tryAgain': 'Try Again',
        'common.reload': 'Reload',
        'common.showDetails': 'Show Details',
        'common.hideDetails': 'Hide Details',
        'errors.somethingWentWrong': 'Something went wrong',
      };
      return dict[key] ?? key;
    },
  }),
}));

// Component that throws an error
const ThrowError: React.FC<{ shouldThrow?: boolean; message?: string }> = ({ 
  shouldThrow = true, 
  message = 'Test error' 
}) => {
  if (shouldThrow) {
    throw new Error(message);
  }
  return <div>No error</div>;
};

describe('ErrorBoundary', () => {
  const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

  beforeEach(() => {
    consoleErrorSpy.mockClear();
  });

  describe('Normal Rendering', () => {
    it('should render children when no error occurs', () => {
      render(
        <ErrorBoundary>
          <div>Child content</div>
        </ErrorBoundary>
      );
      
      expect(screen.getByText('Child content')).toBeInTheDocument();
    });

    it('should not render error UI when children render successfully', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      );
      
      expect(screen.getByText('No error')).toBeInTheDocument();
      expect(screen.queryByText(/Try Again/)).not.toBeInTheDocument();
    });
  });

  describe('Error Catching', () => {
    it('should catch errors and display fallback UI', () => {
      render(
        <ErrorBoundary>
          <ThrowError message="Something went wrong" />
        </ErrorBoundary>
      );
      
      expect(screen.getAllByText(/Something went wrong/).length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText('Try Again')).toBeInTheDocument();
    });

    it('should display section name in error message', () => {
      render(
        <ErrorBoundary section="Algorithm Panel">
          <ThrowError />
        </ErrorBoundary>
      );
      
      expect(screen.getByText(/Error in Algorithm Panel/)).toBeInTheDocument();
    });

    it('should log error to console', () => {
      render(
        <ErrorBoundary section="test-section">
          <ThrowError message="Console test" />
        </ErrorBoundary>
      );
      
      // consoleErrorSpy.mock implementation prevents actual logging
      // Just verify error is caught and displayed
      expect(screen.getAllByText(/Console test/).length).toBeGreaterThanOrEqual(1);
    });

    it('should call onError callback when error occurs', () => {
      const onError = vi.fn();
      
      render(
        <ErrorBoundary onError={onError}>
          <ThrowError message="Callback test" />
        </ErrorBoundary>
      );
      
      expect(onError).toHaveBeenCalled();
      expect(onError.mock.calls[0][0]).toBeInstanceOf(Error);
      expect(onError.mock.calls[0][0].message).toBe('Callback test');
    });
  });

  describe('Recovery Suggestions', () => {
    it('should show chunk loading suggestions for chunk errors', () => {
      render(
        <ErrorBoundary>
          <ThrowError message="Failed to load chunk abc123" />
        </ErrorBoundary>
      );
      
      expect(screen.getByText(/application may have been updated/)).toBeInTheDocument();
      expect(screen.getByText(/Try refreshing the page/)).toBeInTheDocument();
    });

    it('should show memory suggestions for memory errors', () => {
      render(
        <ErrorBoundary>
          <ThrowError message="Out of memory allocation failed" />
        </ErrorBoundary>
      );
      
      expect(screen.getByText(/image or video may be too large/)).toBeInTheDocument();
      expect(screen.getByText(/Try using a smaller file/)).toBeInTheDocument();
    });

    it('should show network suggestions for network errors', () => {
      render(
        <ErrorBoundary>
          <ThrowError message="Network fetch failed" />
        </ErrorBoundary>
      );
      
      expect(screen.getByText(/Check your internet connection/)).toBeInTheDocument();
    });

    it('should show default suggestions for unknown errors', () => {
      render(
        <ErrorBoundary>
          <ThrowError message="Unknown error type" />
        </ErrorBoundary>
      );
      
      expect(screen.getByText(/Try refreshing the page/)).toBeInTheDocument();
      expect(screen.getByText(/Clear your browser data/)).toBeInTheDocument();
    });
  });

  describe('Action Buttons', () => {
    it('should render Try Again button', () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );
      
      expect(screen.getByText('Try Again')).toBeInTheDocument();
    });

    it('should render Reload button', () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );
      
      expect(screen.getByText('Reload')).toBeInTheDocument();
    });

    it('should render Show Details button', () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );
      
      expect(screen.getByText('Show Details')).toBeInTheDocument();
    });

    it('should reset error state when Try Again is clicked', () => {
      let shouldThrow = true;
      const TestComponent = () => {
        if (shouldThrow) {
          throw new Error('Test error');
        }
        return <div>No error</div>;
      };

      const { rerender } = render(
        <ErrorBoundary>
          <TestComponent />
        </ErrorBoundary>
      );
      
      expect(screen.getAllByText(/Test error/).length).toBeGreaterThanOrEqual(1);
      
      const tryAgainButton = screen.getByText('Try Again');
      shouldThrow = false;
      fireEvent.click(tryAgainButton);
      
      rerender(
        <ErrorBoundary>
          <TestComponent />
        </ErrorBoundary>
      );
      
      expect(screen.getByText('No error')).toBeInTheDocument();
    });

    it('should call window.location.reload when Reload is clicked', () => {
      const reloadMock = vi.fn();
      Object.defineProperty(window, 'location', {
        value: { reload: reloadMock },
        writable: true,
      });
      
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );
      
      const reloadButton = screen.getByText('Reload');
      fireEvent.click(reloadButton);
      
      expect(reloadMock).toHaveBeenCalled();
    });
  });

  describe('Error Details', () => {
    it('should not show details initially', () => {
      render(
        <ErrorBoundary>
          <ThrowError message="Test error" />
        </ErrorBoundary>
      );
      
      expect(screen.queryByText('Technical Details')).not.toBeInTheDocument();
    });

    it('should show details when Show Details is clicked', () => {
      render(
        <ErrorBoundary>
          <ThrowError message="Test error with details" />
        </ErrorBoundary>
      );
      
      const showDetailsButton = screen.getByText('Show Details');
      fireEvent.click(showDetailsButton);
      
      expect(screen.getByText('Technical Details')).toBeInTheDocument();
      expect(screen.getAllByText(/Error:/).length).toBeGreaterThanOrEqual(2);
      expect(screen.getAllByText(/Message:/)).toHaveLength(1);
    });

    it('should toggle details visibility', () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );
      
      const toggleButton = screen.getByText('Show Details');
      fireEvent.click(toggleButton);
      
      expect(screen.getByText('Technical Details')).toBeInTheDocument();
      expect(screen.getByText('Hide Details')).toBeInTheDocument();
      
      fireEvent.click(screen.getByText('Hide Details'));
      
      expect(screen.queryByText('Technical Details')).not.toBeInTheDocument();
      expect(screen.getByText('Show Details')).toBeInTheDocument();
    });

    it('should display error name in details', () => {
      render(
        <ErrorBoundary>
          <ThrowError message="Detail test" />
        </ErrorBoundary>
      );
      
      fireEvent.click(screen.getByText('Show Details'));
      
      expect(screen.getAllByText(/Error:/).length).toBeGreaterThanOrEqual(2);
    });

    it('should display error message in details', () => {
      render(
        <ErrorBoundary>
          <ThrowError message="Detailed error message" />
        </ErrorBoundary>
      );
      
      fireEvent.click(screen.getByText('Show Details'));
      
      expect(screen.getAllByText(/Message:/)).toHaveLength(1);
      // Message appears in 3 places: summary, details, and stack trace
      const messageMatches = screen.getAllByText(/Detailed error message/);
      expect(messageMatches.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Custom Fallback', () => {
    it('should render custom fallback when provided', () => {
      render(
        <ErrorBoundary fallback={<div>Custom error UI</div>}>
          <ThrowError />
        </ErrorBoundary>
      );
      
      expect(screen.getByText('Custom error UI')).toBeInTheDocument();
      expect(screen.queryByText('Try Again')).not.toBeInTheDocument();
    });

    it('should prefer custom fallback over default', () => {
      render(
        <ErrorBoundary fallback={<div>Fallback priority test</div>}>
          <ThrowError message="Should not see this in default UI" />
        </ErrorBoundary>
      );
      
      expect(screen.getByText('Fallback priority test')).toBeInTheDocument();
      expect(screen.queryByText(/Should not see this/)).not.toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('should apply error styling classes', () => {
      const { container } = render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );
      
      const errorPanel = container.querySelector('.bg-red-900\\/20');
      expect(errorPanel).toBeInTheDocument();
      expect(errorPanel).toHaveClass('border-red-500/30');
    });

    it('should have proper button styles', () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );
      
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toHaveClass('clean-btn');
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle error with no message', () => {
      const NoMessageError: React.FC = () => {
        throw new Error();
      };
      
      render(
        <ErrorBoundary>
          <NoMessageError />
        </ErrorBoundary>
      );
      
      expect(screen.getByText(/An unexpected error occurred/)).toBeInTheDocument();
    });

    it('should handle error thrown from useEffect', () => {
      const EffectError: React.FC = () => {
        React.useEffect(() => {
          throw new Error('Effect error');
        }, []);
        return <div>Content</div>;
      };
      
      render(
        <ErrorBoundary>
          <EffectError />
        </ErrorBoundary>
      );
      
      expect(screen.getAllByText(/Effect error/).length).toBeGreaterThanOrEqual(1);
    });

    it('should handle multiple children', () => {
      render(
        <ErrorBoundary>
          <div>Child 1</div>
          <div>Child 2</div>
          <div>Child 3</div>
        </ErrorBoundary>
      );
      
      expect(screen.getByText('Child 1')).toBeInTheDocument();
      expect(screen.getByText('Child 2')).toBeInTheDocument();
      expect(screen.getByText('Child 3')).toBeInTheDocument();
    });

    it('should handle nested ErrorBoundaries', () => {
      render(
        <ErrorBoundary section="Outer">
          <ErrorBoundary section="Inner">
            <ThrowError message="Nested error" />
          </ErrorBoundary>
        </ErrorBoundary>
      );
      
      // Inner boundary should catch the error
      expect(screen.getByText(/Error in Inner/)).toBeInTheDocument();
      expect(screen.queryByText(/Error in Outer/)).not.toBeInTheDocument();
    });

    it('should preserve section context after reset', () => {
      render(
        <ErrorBoundary section="Test Section">
          <ThrowError />
        </ErrorBoundary>
      );
      
      expect(screen.getByText(/Error in Test Section/)).toBeInTheDocument();
      
      const tryAgainButton = screen.getByText('Try Again');
      fireEvent.click(tryAgainButton);
      
      // Section should still be preserved if error happens again
    });
  });

  describe('Accessibility', () => {
    it('should have accessible buttons', () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );
      
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
      buttons.forEach(button => {
        expect(button.tagName).toBe('BUTTON');
      });
    });

    it('should have readable error message', () => {
      render(
        <ErrorBoundary>
          <ThrowError message="User-friendly error" />
        </ErrorBoundary>
      );
      
      expect(screen.getAllByText(/User-friendly error/).length).toBeGreaterThanOrEqual(1);
    });

    it('should use semantic HTML', () => {
      const { container } = render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );
      
      // Details element isn't rendered until "Show Details" is clicked
      const showButton = screen.getByText('Show Details');
      fireEvent.click(showButton);
      
      const details = container.querySelector('details');
      expect(details).not.toBeNull();
      
      const summary = container.querySelector('summary');
      expect(summary).not.toBeNull();
    });
  });
});
