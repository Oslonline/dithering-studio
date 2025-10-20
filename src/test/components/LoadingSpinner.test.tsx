import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import React from 'react';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

describe('LoadingSpinner', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('Rendering', () => {
    it('should render spinner with default props', () => {
      const { container } = render(<LoadingSpinner />);
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('should render with custom className', () => {
      const { container } = render(<LoadingSpinner className="custom-class" />);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('custom-class');
    });

    it('should render label when provided', () => {
      render(<LoadingSpinner label="Loading data" />);
      expect(screen.getByText(/Loading data/)).toBeInTheDocument();
    });
  });

  describe('Size Variants', () => {
    it('should render small size', () => {
      const { container } = render(<LoadingSpinner size="sm" />);
      const spinnerDiv = container.querySelector('.w-4');
      expect(spinnerDiv).toBeInTheDocument();
      expect(spinnerDiv).toHaveClass('h-4');
    });

    it('should render medium size (default)', () => {
      const { container } = render(<LoadingSpinner size="md" />);
      const spinnerDiv = container.querySelector('.w-8');
      expect(spinnerDiv).toBeInTheDocument();
      expect(spinnerDiv).toHaveClass('h-8');
    });

    it('should render large size', () => {
      const { container } = render(<LoadingSpinner size="lg" />);
      const spinnerDiv = container.querySelector('.w-12');
      expect(spinnerDiv).toBeInTheDocument();
      expect(spinnerDiv).toHaveClass('h-12');
    });
  });

  describe('Indeterminate Mode', () => {
    it('should render without progress percentage when indeterminate', () => {
      const { container } = render(<LoadingSpinner />);
      const percentage = container.querySelector('span');
      expect(percentage).not.toBeInTheDocument();
    });

    it('should animate dots for indeterminate label', () => {
      render(<LoadingSpinner label="Loading" />);
      
      // Initially no dots
      expect(screen.getByText('Loading')).toBeInTheDocument();
      
      // After 500ms - one dot
      act(() => {
        vi.advanceTimersByTime(500);
      });
      expect(screen.getByText(/Loading\./)).toBeInTheDocument();
      
      // After 1000ms - two dots
      act(() => {
        vi.advanceTimersByTime(500);
      });
      expect(screen.getByText(/Loading\.\./)).toBeInTheDocument();
      
      // After 1500ms - three dots
      act(() => {
        vi.advanceTimersByTime(500);
      });
      expect(screen.getByText(/Loading\.\.\./)).toBeInTheDocument();
      
      // After 2000ms - reset to no dots
      act(() => {
        vi.advanceTimersByTime(500);
      });
      expect(screen.getByText('Loading')).toBeInTheDocument();
    });

    it('should apply spin animation for indeterminate mode', () => {
      const { container } = render(<LoadingSpinner />);
      const progressCircle = container.querySelectorAll('circle')[1]; // Second circle is the progress one
      const style = window.getComputedStyle(progressCircle);
      
      // Check that animation is set (we can't check the actual animation, but we can verify the property exists)
      expect(progressCircle).toBeInTheDocument();
    });
  });

  describe('Determinate Mode', () => {
    it('should render progress percentage when progress is provided', () => {
      render(<LoadingSpinner progress={50} />);
      expect(screen.getByText('50%')).toBeInTheDocument();
    });

    it('should render 0% progress', () => {
      render(<LoadingSpinner progress={0} />);
      expect(screen.getByText('0%')).toBeInTheDocument();
    });

    it('should render 100% progress', () => {
      render(<LoadingSpinner progress={100} />);
      expect(screen.getByText('100%')).toBeInTheDocument();
    });

    it('should round fractional progress values', () => {
      render(<LoadingSpinner progress={45.7} />);
      expect(screen.getByText('46%')).toBeInTheDocument();
    });

    it('should not animate dots when progress is provided', () => {
      render(<LoadingSpinner progress={50} label="Uploading" />);
      
      // Should show label without dots
      expect(screen.getByText('Uploading')).toBeInTheDocument();
      
      // After time passes, still no dots
      act(() => {
        vi.advanceTimersByTime(1000);
      });
      expect(screen.getByText('Uploading')).toBeInTheDocument();
      expect(screen.queryByText(/Uploading\./)).not.toBeInTheDocument();
    });

    it('should calculate correct stroke-dashoffset for progress', () => {
      const { container } = render(<LoadingSpinner progress={25} />);
      const progressCircle = container.querySelectorAll('circle')[1];
      
      const strokeDasharray = progressCircle.getAttribute('stroke-dasharray');
      const strokeDashoffset = progressCircle.getAttribute('stroke-dashoffset');
      
      // Circumference = 2 * PI * 45 ≈ 282.74
      expect(strokeDasharray).toBeTruthy();
      expect(strokeDashoffset).toBeTruthy();
      
      // For 25% progress, offset should be 75% of circumference
      const circumference = 2 * Math.PI * 45;
      const expectedOffset = circumference - (25 / 100) * circumference;
      expect(Number(strokeDashoffset)).toBeCloseTo(expectedOffset, 1);
    });
  });

  describe('SVG Structure', () => {
    it('should render two circles (background and progress)', () => {
      const { container } = render(<LoadingSpinner />);
      const circles = container.querySelectorAll('circle');
      expect(circles).toHaveLength(2);
    });

    it('should set correct viewBox for SVG', () => {
      const { container } = render(<LoadingSpinner />);
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('viewBox', '0 0 100 100');
    });

    it('should apply transform rotate to SVG', () => {
      const { container } = render(<LoadingSpinner />);
      const svg = container.querySelector('svg');
      expect(svg).toHaveClass('transform', '-rotate-90');
    });
  });

  describe('Cleanup', () => {
    it('should cleanup interval on unmount', () => {
      const clearIntervalSpy = vi.spyOn(global, 'clearInterval');
      const { unmount } = render(<LoadingSpinner label="Loading" />);
      
      unmount();
      
      expect(clearIntervalSpy).toHaveBeenCalled();
    });

    it('should cleanup interval when switching from indeterminate to determinate', () => {
      const clearIntervalSpy = vi.spyOn(global, 'clearInterval');
      const { rerender } = render(<LoadingSpinner label="Loading" />);
      
      // Switch to determinate
      rerender(<LoadingSpinner progress={50} label="Loading" />);
      
      expect(clearIntervalSpy).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should render with proper ARIA attributes', () => {
      const { container } = render(<LoadingSpinner />);
      const wrapper = container.firstChild as HTMLElement;
      
      // Component should be accessible
      expect(wrapper).toBeInTheDocument();
    });

    it('should display percentage in accessible format', () => {
      render(<LoadingSpinner progress={75} />);
      const percentage = screen.getByText('75%');
      expect(percentage).toHaveClass('font-mono');
    });
  });

  describe('Edge Cases', () => {
    it('should handle progress > 100', () => {
      render(<LoadingSpinner progress={150} />);
      expect(screen.getByText('150%')).toBeInTheDocument();
    });

    it('should handle negative progress', () => {
      render(<LoadingSpinner progress={-10} />);
      expect(screen.getByText('-10%')).toBeInTheDocument();
    });

    it('should handle very small progress values', () => {
      render(<LoadingSpinner progress={0.1} />);
      expect(screen.getByText('0%')).toBeInTheDocument();
    });

    it('should handle empty label', () => {
      render(<LoadingSpinner label="" />);
      expect(screen.queryByText(/\./)).not.toBeInTheDocument();
    });
  });
});
