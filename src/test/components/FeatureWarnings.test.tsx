import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { FeatureWarnings } from '../../components/FeatureWarnings';
import * as featureDetection from '../../utils/featureDetection';

vi.mock('../../utils/featureDetection', () => ({
  detectAllFeatures: vi.fn(),
  getUnsupportedFeatures: vi.fn(() => []),
}));

vi.mock('react-icons/fa', () => ({
  FaExclamationTriangle: () => <div data-testid="warning-icon" />,
  FaTimes: () => <div data-testid="close-icon" />,
}));

describe('FeatureWarnings', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Rendering', () => {
    it('should not render when no unsupported features', () => {
      vi.mocked(featureDetection.getUnsupportedFeatures).mockReturnValue([]);
      
      const { container } = render(<FeatureWarnings />);
      expect(container.firstChild).toBeNull();
    });

    it('should render warning for unsupported feature', () => {
      vi.mocked(featureDetection.getUnsupportedFeatures).mockReturnValue([
        { feature: 'WebGL', message: 'Your browser does not support WebGL' },
      ]);
      
      render(<FeatureWarnings />);
      expect(screen.getByText('WebGL not supported')).toBeInTheDocument();
      expect(screen.getByText('Your browser does not support WebGL')).toBeInTheDocument();
    });

    it('should render multiple warnings', () => {
      vi.mocked(featureDetection.getUnsupportedFeatures).mockReturnValue([
        { feature: 'WebGL', message: 'WebGL not available' },
        { feature: 'WebWorker', message: 'Web Workers not available' },
        { feature: 'OffscreenCanvas', message: 'OffscreenCanvas not available' },
      ]);
      
      render(<FeatureWarnings />);
      expect(screen.getByText('WebGL not supported')).toBeInTheDocument();
      expect(screen.getByText('WebWorker not supported')).toBeInTheDocument();
      expect(screen.getByText('OffscreenCanvas not supported')).toBeInTheDocument();
    });

    it('should have proper styling classes', () => {
      vi.mocked(featureDetection.getUnsupportedFeatures).mockReturnValue([
        { feature: 'Test', message: 'Test message' },
      ]);
      
      const { container } = render(<FeatureWarnings />);
      const warning = container.querySelector('.bg-yellow-900\\/90');
      expect(warning).toBeInTheDocument();
      expect(warning).toHaveClass('border-yellow-500/50');
    });

    it('should render warning and close icons', () => {
      vi.mocked(featureDetection.getUnsupportedFeatures).mockReturnValue([
        { feature: 'Test', message: 'Test message' },
      ]);
      
      render(<FeatureWarnings />);
      expect(screen.getByTestId('warning-icon')).toBeInTheDocument();
      expect(screen.getByTestId('close-icon')).toBeInTheDocument();
    });
  });

  describe('Feature Detection', () => {
    it('should call detectAllFeatures on mount', () => {
      vi.mocked(featureDetection.getUnsupportedFeatures).mockReturnValue([]);
      
      render(<FeatureWarnings />);
      expect(featureDetection.detectAllFeatures).toHaveBeenCalled();
    });

    it('should call getUnsupportedFeatures on mount', () => {
      vi.mocked(featureDetection.getUnsupportedFeatures).mockReturnValue([]);
      
      render(<FeatureWarnings />);
      expect(featureDetection.getUnsupportedFeatures).toHaveBeenCalled();
    });
  });

  describe('Dismissal', () => {
    it('should have dismiss button with proper aria-label', () => {
      vi.mocked(featureDetection.getUnsupportedFeatures).mockReturnValue([
        { feature: 'Test', message: 'Test message' },
      ]);
      
      render(<FeatureWarnings />);
      const dismissButton = screen.getByLabelText('Dismiss');
      expect(dismissButton).toBeInTheDocument();
    });

    it('should remove warning when dismissed', () => {
      vi.mocked(featureDetection.getUnsupportedFeatures).mockReturnValue([
        { feature: 'WebGL', message: 'WebGL not available' },
      ]);
      
      render(<FeatureWarnings />);
      expect(screen.getByText('WebGL not supported')).toBeInTheDocument();
      
      const dismissButton = screen.getByLabelText('Dismiss');
      fireEvent.click(dismissButton);
      
      expect(screen.queryByText('WebGL not supported')).not.toBeInTheDocument();
    });

    it('should save dismissal to localStorage', () => {
      vi.mocked(featureDetection.getUnsupportedFeatures).mockReturnValue([
        { feature: 'WebGL', message: 'WebGL not available' },
      ]);
      
      render(<FeatureWarnings />);
      const dismissButton = screen.getByLabelText('Dismiss');
      fireEvent.click(dismissButton);
      
      const stored = localStorage.getItem('dismissed-feature-warnings');
      expect(stored).toBeTruthy();
      expect(JSON.parse(stored!)).toEqual(['WebGL']);
    });

    it('should dismiss only the clicked warning when multiple exist', () => {
      vi.mocked(featureDetection.getUnsupportedFeatures).mockReturnValue([
        { feature: 'WebGL', message: 'WebGL not available' },
        { feature: 'WebWorker', message: 'WebWorker not available' },
      ]);
      
      render(<FeatureWarnings />);
      expect(screen.getByText('WebGL not supported')).toBeInTheDocument();
      expect(screen.getByText('WebWorker not supported')).toBeInTheDocument();
      
      const dismissButtons = screen.getAllByLabelText('Dismiss');
      fireEvent.click(dismissButtons[0]); // Dismiss WebGL
      
      expect(screen.queryByText('WebGL not supported')).not.toBeInTheDocument();
      expect(screen.getByText('WebWorker not supported')).toBeInTheDocument();
    });

    it('should persist multiple dismissals', () => {
      vi.mocked(featureDetection.getUnsupportedFeatures).mockReturnValue([
        { feature: 'WebGL', message: 'WebGL not available' },
        { feature: 'WebWorker', message: 'WebWorker not available' },
      ]);
      
      render(<FeatureWarnings />);
      const dismissButtons = screen.getAllByLabelText('Dismiss');
      
      fireEvent.click(dismissButtons[0]);
      fireEvent.click(dismissButtons[1]);
      
      const stored = localStorage.getItem('dismissed-feature-warnings');
      const parsed = JSON.parse(stored!);
      expect(parsed).toContain('WebGL');
      expect(parsed).toContain('WebWorker');
    });
  });

  describe('localStorage Persistence', () => {
    it('should load dismissed warnings from localStorage on mount', () => {
      localStorage.setItem('dismissed-feature-warnings', JSON.stringify(['WebGL']));
      
      vi.mocked(featureDetection.getUnsupportedFeatures).mockReturnValue([
        { feature: 'WebGL', message: 'WebGL not available' },
        { feature: 'WebWorker', message: 'WebWorker not available' },
      ]);
      
      render(<FeatureWarnings />);
      
      expect(screen.queryByText('WebGL not supported')).not.toBeInTheDocument();
      expect(screen.getByText('WebWorker not supported')).toBeInTheDocument();
    });

    it('should handle invalid localStorage data gracefully', () => {
      localStorage.setItem('dismissed-feature-warnings', 'invalid json{');
      
      vi.mocked(featureDetection.getUnsupportedFeatures).mockReturnValue([
        { feature: 'WebGL', message: 'WebGL not available' },
      ]);
      
      // Should not throw error
      expect(() => render(<FeatureWarnings />)).not.toThrow();
      expect(screen.getByText('WebGL not supported')).toBeInTheDocument();
    });

    it('should handle empty localStorage', () => {
      vi.mocked(featureDetection.getUnsupportedFeatures).mockReturnValue([
        { feature: 'WebGL', message: 'WebGL not available' },
      ]);
      
      render(<FeatureWarnings />);
      expect(screen.getByText('WebGL not supported')).toBeInTheDocument();
    });
  });

  describe('Visual Layout', () => {
    it('should position warnings in top-right corner', () => {
      vi.mocked(featureDetection.getUnsupportedFeatures).mockReturnValue([
        { feature: 'Test', message: 'Test message' },
      ]);
      
      const { container } = render(<FeatureWarnings />);
      const warningsContainer = container.firstChild as HTMLElement;
      expect(warningsContainer).toHaveClass('fixed', 'top-4', 'right-4', 'z-50');
    });

    it('should stack multiple warnings with spacing', () => {
      vi.mocked(featureDetection.getUnsupportedFeatures).mockReturnValue([
        { feature: 'WebGL', message: 'WebGL not available' },
        { feature: 'WebWorker', message: 'WebWorker not available' },
      ]);
      
      const { container } = render(<FeatureWarnings />);
      const warningsContainer = container.firstChild as HTMLElement;
      expect(warningsContainer).toHaveClass('space-y-2');
    });

    it('should have max-width constraint', () => {
      vi.mocked(featureDetection.getUnsupportedFeatures).mockReturnValue([
        { feature: 'Test', message: 'Test message' },
      ]);
      
      const { container } = render(<FeatureWarnings />);
      const warningsContainer = container.firstChild as HTMLElement;
      expect(warningsContainer).toHaveClass('max-w-md');
    });
  });

  describe('Edge Cases', () => {
    it('should handle feature with empty message', () => {
      vi.mocked(featureDetection.getUnsupportedFeatures).mockReturnValue([
        { feature: 'Test', message: '' },
      ]);
      
      render(<FeatureWarnings />);
      expect(screen.getByText('Test not supported')).toBeInTheDocument();
    });

    it('should handle feature with special characters in name', () => {
      vi.mocked(featureDetection.getUnsupportedFeatures).mockReturnValue([
        { feature: 'Test-Feature_123', message: 'Not available' },
      ]);
      
      render(<FeatureWarnings />);
      expect(screen.getByText('Test-Feature_123 not supported')).toBeInTheDocument();
    });

    it('should handle dismissing and re-adding same feature', () => {
      vi.mocked(featureDetection.getUnsupportedFeatures).mockReturnValue([
        { feature: 'WebGL', message: 'WebGL not available' },
      ]);
      
      const { rerender } = render(<FeatureWarnings />);
      
      const dismissButton = screen.getByLabelText('Dismiss');
      fireEvent.click(dismissButton);
      
      expect(screen.queryByText('WebGL not supported')).not.toBeInTheDocument();
      
      // Remount component (simulating page refresh)
      rerender(<FeatureWarnings />);
      
      // Should still be dismissed
      expect(screen.queryByText('WebGL not supported')).not.toBeInTheDocument();
    });

    it('should not render if all warnings are dismissed', () => {
      vi.mocked(featureDetection.getUnsupportedFeatures).mockReturnValue([
        { feature: 'WebGL', message: 'WebGL not available' },
      ]);
      
      const { container } = render(<FeatureWarnings />);
      
      const dismissButton = screen.getByLabelText('Dismiss');
      fireEvent.click(dismissButton);
      
      expect(container.firstChild).toBeNull();
    });
  });

  describe('Accessibility', () => {
    it('should have accessible button', () => {
      vi.mocked(featureDetection.getUnsupportedFeatures).mockReturnValue([
        { feature: 'Test', message: 'Test message' },
      ]);
      
      render(<FeatureWarnings />);
      const button = screen.getByLabelText('Dismiss');
      expect(button).toHaveAttribute('aria-label', 'Dismiss');
    });

    it('should be keyboard navigable', () => {
      vi.mocked(featureDetection.getUnsupportedFeatures).mockReturnValue([
        { feature: 'Test', message: 'Test message' },
      ]);
      
      render(<FeatureWarnings />);
      const button = screen.getByLabelText('Dismiss');
      expect(button.tagName).toBe('BUTTON');
    });
  });
});
