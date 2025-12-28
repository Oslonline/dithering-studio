import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act, within } from '@testing-library/react';
import React from 'react';
import ProcessingOverlay from '../../components/ui/ProcessingOverlay';

describe('ProcessingOverlay', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('Visibility', () => {
    it('should not render when isProcessing is false', () => {
      const { container } = render(<ProcessingOverlay isProcessing={false} />);
      expect(container.firstChild).toBeNull();
    });

    it('should render when isProcessing is true', () => {
      render(<ProcessingOverlay isProcessing={true} />);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should have proper ARIA attributes', () => {
      render(<ProcessingOverlay isProcessing={true} />);
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      expect(dialog).toHaveAttribute('aria-label', 'Processing');
    });
  });

  describe('Operation Label', () => {
    it('should display default operation text', () => {
      render(<ProcessingOverlay isProcessing={true} />);
      const dialog = screen.getByRole('dialog', { name: 'Processing' });
      expect(within(dialog).getByText(/^Processing$/)).toBeInTheDocument();
    });

    it('should display custom operation text', () => {
      render(<ProcessingOverlay isProcessing={true} operation="Uploading image" />);
      const dialog = screen.getByRole('dialog', { name: 'Processing' });
      expect(within(dialog).getByText(/^Uploading image$/)).toBeInTheDocument();
    });
  });

  describe('Progress Display', () => {
    it('should render LoadingSpinner with progress', () => {
      render(<ProcessingOverlay isProcessing={true} progress={50} />);
      expect(screen.getByText('50%')).toBeInTheDocument();
    });

    it('should render progress bar when progress is provided', () => {
      const { container } = render(<ProcessingOverlay isProcessing={true} progress={75} />);
      const progressBar = container.querySelector('[style*="width: 75%"]');
      expect(progressBar).toBeInTheDocument();
    });

    it('should not render progress bar when progress is undefined', () => {
      const { container } = render(<ProcessingOverlay isProcessing={true} />);
      const progressBar = container.querySelector('.h-1\\.5');
      expect(progressBar).toBeNull();
    });

    it('should update progress bar width dynamically', () => {
      const { container, rerender } = render(
        <ProcessingOverlay isProcessing={true} progress={25} />
      );
      
      let progressBar = container.querySelector('[style*="width: 25%"]');
      expect(progressBar).toBeInTheDocument();

      rerender(<ProcessingOverlay isProcessing={true} progress={75} />);
      progressBar = container.querySelector('[style*="width: 75%"]');
      expect(progressBar).toBeInTheDocument();
    });
  });

  describe('Elapsed Time', () => {
    it('should show initial elapsed time as 0s', () => {
      render(<ProcessingOverlay isProcessing={true} />);
      expect(screen.getByText(/Elapsed: 0s/)).toBeInTheDocument();
    });

    it('should update elapsed time every second', () => {
      render(<ProcessingOverlay isProcessing={true} />);
      
      expect(screen.getByText(/Elapsed: 0s/)).toBeInTheDocument();
      
      act(() => {
        vi.advanceTimersByTime(1000);
      });
      expect(screen.getByText(/Elapsed: 1s/)).toBeInTheDocument();
      
      act(() => {
        vi.advanceTimersByTime(1000);
      });
      expect(screen.getByText(/Elapsed: 2s/)).toBeInTheDocument();
    });

    it('should format elapsed time as minutes and seconds', () => {
      render(<ProcessingOverlay isProcessing={true} />);
      
      act(() => {
        vi.advanceTimersByTime(65000); // 65 seconds
      });
      expect(screen.getByText(/Elapsed: 1m 5s/)).toBeInTheDocument();
    });

    it('should reset elapsed time when isProcessing becomes false', () => {
      const { rerender } = render(<ProcessingOverlay isProcessing={true} />);
      
      act(() => {
        vi.advanceTimersByTime(5000);
      });
      expect(screen.getByText(/Elapsed: 5s/)).toBeInTheDocument();
      
      rerender(<ProcessingOverlay isProcessing={false} />);
      
      rerender(<ProcessingOverlay isProcessing={true} />);
      expect(screen.getByText(/Elapsed: 0s/)).toBeInTheDocument();
    });
  });

  describe('Remaining Time', () => {
    it('should not show remaining time without estimatedTime', () => {
      render(<ProcessingOverlay isProcessing={true} progress={50} />);
      expect(screen.queryByText(/left/)).not.toBeInTheDocument();
    });

    it('should show remaining time when estimatedTime and progress are provided', () => {
      render(
        <ProcessingOverlay 
          isProcessing={true} 
          progress={50} 
          estimatedTime={100} 
        />
      );
      expect(screen.getByText(/left/)).toBeInTheDocument();
    });

    it('should calculate remaining time correctly', () => {
      render(
        <ProcessingOverlay 
          isProcessing={true} 
          progress={50} 
          estimatedTime={10} // 10 seconds total
        />
      );
      
      // At 50% progress with 10s total: 5s remaining - 0s elapsed = 5s
      expect(screen.getByText(/~5s left/)).toBeInTheDocument();
    });

    it('should update remaining time as progress increases', () => {
      const { rerender } = render(
        <ProcessingOverlay 
          isProcessing={true} 
          progress={25} 
          estimatedTime={100} 
        />
      );
      
      // At 25% with 100s total: 75s remaining (formatted as 1m 15s)
      expect(screen.getByText(/~1m 15s left/)).toBeInTheDocument();
      
      rerender(
        <ProcessingOverlay 
          isProcessing={true} 
          progress={75} 
          estimatedTime={100} 
        />
      );
      
      // At 75% with 100s total: 25s remaining
      expect(screen.getByText(/~25s left/)).toBeInTheDocument();
    });

    it('should not show negative remaining time', () => {
      render(
        <ProcessingOverlay 
          isProcessing={true} 
          progress={10} 
          estimatedTime={1} // Underestimated
        />
      );
      
      act(() => {
        vi.advanceTimersByTime(5000); // Elapsed > estimated
      });
      
      // Should show 0s, not negative
      expect(screen.getByText(/~0s left/)).toBeInTheDocument();
    });
  });

  describe('Helpful Tip', () => {
    it('should not show tip initially', () => {
      render(<ProcessingOverlay isProcessing={true} />);
      expect(screen.queryByText(/💡 Tip:/)).not.toBeInTheDocument();
    });

    it('should show tip after 5 seconds', () => {
      render(<ProcessingOverlay isProcessing={true} />);
      
      expect(screen.queryByText(/💡 Tip:/)).not.toBeInTheDocument();
      
      act(() => {
        vi.advanceTimersByTime(6000);
      });
      
      expect(screen.getByText(/💡 Tip:/)).toBeInTheDocument();
      expect(screen.getByText(/reducing the working resolution/)).toBeInTheDocument();
    });

    it('should not show tip if processing finishes before 5 seconds', () => {
      const { rerender } = render(<ProcessingOverlay isProcessing={true} />);
      
      act(() => {
        vi.advanceTimersByTime(3000);
      });
      
      rerender(<ProcessingOverlay isProcessing={false} />);
      
      expect(screen.queryByText(/💡 Tip:/)).not.toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('should apply custom className', () => {
      const { container } = render(
        <ProcessingOverlay isProcessing={true} className="custom-overlay" />
      );
      const dialog = container.querySelector('[role="dialog"]');
      expect(dialog).toHaveClass('custom-overlay');
    });

    it('should have backdrop and overlay styles', () => {
      const { container } = render(<ProcessingOverlay isProcessing={true} />);
      const dialog = container.querySelector('[role="dialog"]');
      expect(dialog).toHaveClass('backdrop-blur-sm', 'bg-black/60');
    });

    it('should have animation classes', () => {
      const { container } = render(<ProcessingOverlay isProcessing={true} />);
      const dialog = container.querySelector('[role="dialog"]');
      expect(dialog).toHaveClass('animate-fade-in');
      
      const panel = container.querySelector('.min-panel-alt');
      expect(panel).toHaveClass('animate-scale-in');
    });
  });

  describe('Cleanup', () => {
    it('should cleanup interval on unmount', () => {
      const clearIntervalSpy = vi.spyOn(global, 'clearInterval');
      const { unmount } = render(<ProcessingOverlay isProcessing={true} />);
      
      unmount();
      
      expect(clearIntervalSpy).toHaveBeenCalled();
    });

    it('should cleanup interval when isProcessing becomes false', () => {
      const clearIntervalSpy = vi.spyOn(global, 'clearInterval');
      const { rerender } = render(<ProcessingOverlay isProcessing={true} />);
      
      rerender(<ProcessingOverlay isProcessing={false} />);
      
      expect(clearIntervalSpy).toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle 0% progress', () => {
      const { container } = render(
        <ProcessingOverlay isProcessing={true} progress={0} />
      );
      expect(screen.getByText('0%')).toBeInTheDocument();
      const progressBar = container.querySelector('[style*="width: 0%"]');
      expect(progressBar).toBeInTheDocument();
    });

    it('should handle 100% progress', () => {
      const { container } = render(
        <ProcessingOverlay isProcessing={true} progress={100} />
      );
      expect(screen.getByText('100%')).toBeInTheDocument();
      const progressBar = container.querySelector('[style*="width: 100%"]');
      expect(progressBar).toBeInTheDocument();
    });

    it('should handle very long operations', () => {
      render(<ProcessingOverlay isProcessing={true} />);
      
      act(() => {
        vi.advanceTimersByTime(125000); // 2m 5s
      });
      
      expect(screen.getByText(/Elapsed: 2m 5s/)).toBeInTheDocument();
    });

    it('should handle estimatedTime of 0', () => {
      render(
        <ProcessingOverlay 
          isProcessing={true} 
          progress={50} 
          estimatedTime={0} 
        />
      );
      // With estimatedTime 0, remaining time is calculated as 0
      expect(screen.queryByText(/left/)).not.toBeInTheDocument();
    });
  });
});
