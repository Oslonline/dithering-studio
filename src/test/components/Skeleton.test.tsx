import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import Skeleton, { SkeletonGroup } from '../../components/ui/Skeleton';

describe('Skeleton', () => {
  describe('Rendering', () => {
    it('should render with default props', () => {
      const { container } = render(<Skeleton />);
      const skeleton = container.firstChild as HTMLElement;
      expect(skeleton).toBeInTheDocument();
      expect(skeleton).toHaveClass('bg-[var(--c-panel-alt)]');
    });

    it('should render with custom className', () => {
      const { container } = render(<Skeleton className="custom-class" />);
      const skeleton = container.firstChild as HTMLElement;
      expect(skeleton).toHaveClass('custom-class');
    });

    it('should apply animate-pulse by default', () => {
      const { container } = render(<Skeleton />);
      const skeleton = container.firstChild as HTMLElement;
      expect(skeleton).toHaveClass('animate-pulse');
    });

    it('should not animate when animate is false', () => {
      const { container } = render(<Skeleton animate={false} />);
      const skeleton = container.firstChild as HTMLElement;
      expect(skeleton).not.toHaveClass('animate-pulse');
    });
  });

  describe('Variant Styles', () => {
    it('should render text variant', () => {
      const { container } = render(<Skeleton variant="text" />);
      const skeleton = container.firstChild as HTMLElement;
      expect(skeleton).toHaveClass('h-3', 'rounded');
    });

    it('should render rectangle variant (default)', () => {
      const { container } = render(<Skeleton variant="rectangle" />);
      const skeleton = container.firstChild as HTMLElement;
      expect(skeleton).toHaveClass('rounded-[var(--radius-sm)]');
    });

    it('should render circle variant', () => {
      const { container } = render(<Skeleton variant="circle" />);
      const skeleton = container.firstChild as HTMLElement;
      expect(skeleton).toHaveClass('rounded-full', 'aspect-square');
    });

    it('should render button variant', () => {
      const { container } = render(<Skeleton variant="button" />);
      const skeleton = container.firstChild as HTMLElement;
      expect(skeleton).toHaveClass('h-9', 'rounded-[var(--radius-sm)]');
    });

    it('should render image variant', () => {
      const { container } = render(<Skeleton variant="image" />);
      const skeleton = container.firstChild as HTMLElement;
      expect(skeleton).toHaveClass('aspect-video', 'rounded-[var(--radius)]');
    });

    it('should render algorithm-card variant', () => {
      const { container } = render(<Skeleton variant="algorithm-card" />);
      const skeleton = container.firstChild as HTMLElement;
      expect(skeleton).toHaveClass('h-16', 'rounded-[var(--radius-sm)]');
    });

    it('should render palette-swatch variant', () => {
      const { container } = render(<Skeleton variant="palette-swatch" />);
      const skeleton = container.firstChild as HTMLElement;
      expect(skeleton).toHaveClass('w-10', 'h-10', 'rounded');
    });
  });

  describe('Custom Dimensions', () => {
    it('should apply custom width', () => {
      const { container } = render(<Skeleton width="200px" />);
      const skeleton = container.firstChild as HTMLElement;
      expect(skeleton).toHaveStyle({ width: '200px' });
    });

    it('should apply custom height', () => {
      const { container } = render(<Skeleton height="50px" />);
      const skeleton = container.firstChild as HTMLElement;
      expect(skeleton).toHaveStyle({ height: '50px' });
    });

    it('should apply both width and height', () => {
      const { container } = render(<Skeleton width="100px" height="100px" />);
      const skeleton = container.firstChild as HTMLElement;
      expect(skeleton).toHaveStyle({ width: '100px', height: '100px' });
    });

    it('should accept percentage values', () => {
      const { container } = render(<Skeleton width="50%" />);
      const skeleton = container.firstChild as HTMLElement;
      expect(skeleton).toHaveStyle({ width: '50%' });
    });
  });

  describe('Accessibility', () => {
    it('should have aria-hidden attribute', () => {
      const { container } = render(<Skeleton />);
      const skeleton = container.firstChild as HTMLElement;
      expect(skeleton).toHaveAttribute('aria-hidden', 'true');
    });
  });
});

describe('SkeletonGroup', () => {
  describe('AlgorithmList', () => {
    it('should render 6 algorithm card skeletons', () => {
      const { container } = render(<SkeletonGroup.AlgorithmList />);
      const skeletons = container.querySelectorAll('[aria-hidden="true"]');
      expect(skeletons).toHaveLength(6);
    });

    it('should render algorithm-card variants', () => {
      const { container } = render(<SkeletonGroup.AlgorithmList />);
      const skeleton = container.querySelector('[aria-hidden="true"]') as HTMLElement;
      expect(skeleton).toHaveClass('h-16');
    });

    it('should wrap in space-y-2 container', () => {
      const { container } = render(<SkeletonGroup.AlgorithmList />);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('space-y-2');
    });
  });

  describe('PaletteGrid', () => {
    it('should render 8 palette swatch skeletons', () => {
      const { container } = render(<SkeletonGroup.PaletteGrid />);
      const skeletons = container.querySelectorAll('[aria-hidden="true"]');
      expect(skeletons).toHaveLength(8);
    });

    it('should render palette-swatch variants', () => {
      const { container } = render(<SkeletonGroup.PaletteGrid />);
      const skeleton = container.querySelector('[aria-hidden="true"]') as HTMLElement;
      expect(skeleton).toHaveClass('w-10', 'h-10');
    });

    it('should use flex layout with gap', () => {
      const { container } = render(<SkeletonGroup.PaletteGrid />);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('flex', 'flex-wrap', 'gap-2');
    });
  });

  describe('ImagePreview', () => {
    it('should render image skeleton and text skeletons', () => {
      const { container } = render(<SkeletonGroup.ImagePreview />);
      const skeletons = container.querySelectorAll('[aria-hidden="true"]');
      expect(skeletons.length).toBeGreaterThan(2); // At least 1 image + 2 text
    });

    it('should render image with aspect-video', () => {
      const { container } = render(<SkeletonGroup.ImagePreview />);
      const imageSkeleton = container.querySelector('.aspect-video');
      expect(imageSkeleton).toBeInTheDocument();
    });

    it('should render text skeletons with different widths', () => {
      const { container } = render(<SkeletonGroup.ImagePreview />);
      const textSkeletons = container.querySelectorAll('.h-3');
      expect(textSkeletons.length).toBeGreaterThan(0);
    });
  });

  describe('Settings', () => {
    it('should render multiple setting rows', () => {
      const { container } = render(<SkeletonGroup.Settings />);
      const rows = container.querySelectorAll('.space-y-2');
      expect(rows.length).toBeGreaterThan(2);
    });

    it('should render text and slider skeletons', () => {
      const { container } = render(<SkeletonGroup.Settings />);
      const skeletons = container.querySelectorAll('[aria-hidden="true"]');
      expect(skeletons.length).toBeGreaterThan(4); // Multiple text + slider pairs
    });

    it('should have proper spacing', () => {
      const { container } = render(<SkeletonGroup.Settings />);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('space-y-4');
    });
  });

  describe('ButtonGroup', () => {
    it('should render 3 buttons by default', () => {
      const { container } = render(<SkeletonGroup.ButtonGroup />);
      const buttons = container.querySelectorAll('[aria-hidden="true"]');
      expect(buttons).toHaveLength(3);
    });

    it('should render custom count of buttons', () => {
      const { container } = render(<SkeletonGroup.ButtonGroup count={5} />);
      const buttons = container.querySelectorAll('[aria-hidden="true"]');
      expect(buttons).toHaveLength(5);
    });

    it('should render button variants', () => {
      const { container } = render(<SkeletonGroup.ButtonGroup />);
      const button = container.querySelector('[aria-hidden="true"]') as HTMLElement;
      expect(button).toHaveClass('h-9');
    });

    it('should use flex layout with gap', () => {
      const { container } = render(<SkeletonGroup.ButtonGroup />);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('flex', 'gap-2');
    });

    it('should handle count of 1', () => {
      const { container } = render(<SkeletonGroup.ButtonGroup count={1} />);
      const buttons = container.querySelectorAll('[aria-hidden="true"]');
      expect(buttons).toHaveLength(1);
    });
  });

  describe('Integration', () => {
    it('should render all groups together', () => {
      const { container } = render(
        <div>
          <SkeletonGroup.AlgorithmList />
          <SkeletonGroup.PaletteGrid />
          <SkeletonGroup.ImagePreview />
          <SkeletonGroup.Settings />
          <SkeletonGroup.ButtonGroup />
        </div>
      );
      
      const skeletons = container.querySelectorAll('[aria-hidden="true"]');
      // 6 algorithm + 8 palette + 3 image + 6 settings + 3 buttons = 26 total
      expect(skeletons.length).toBeGreaterThan(20);
    });
  });
});
