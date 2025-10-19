interface SkeletonProps {
  variant?: 'text' | 'rectangle' | 'circle' | 'button' | 'image' | 'algorithm-card' | 'palette-swatch';
  width?: string;
  height?: string;
  className?: string;
  animate?: boolean;
}

/**
 * Skeleton loader component that matches the app's design system
 * Used to show placeholder UI while content is loading
 */
const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'rectangle',
  width,
  height,
  className = '',
  animate = true,
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'text':
        return 'h-3 rounded';
      case 'circle':
        return 'rounded-full aspect-square';
      case 'button':
        return 'h-9 rounded-[var(--radius-sm)]';
      case 'image':
        return 'aspect-video rounded-[var(--radius)]';
      case 'algorithm-card':
        return 'h-16 rounded-[var(--radius-sm)]';
      case 'palette-swatch':
        return 'w-10 h-10 rounded';
      default:
        return 'rounded-[var(--radius-sm)]';
    }
  };

  const baseStyles = 'bg-[var(--c-panel-alt)] border border-[var(--c-border)]';
  const animationStyles = animate ? 'animate-pulse' : '';

  const style: React.CSSProperties = {
    width: width || undefined,
    height: height || undefined,
  };

  return (
    <div
      className={`${baseStyles} ${getVariantStyles()} ${animationStyles} ${className}`}
      style={style}
      aria-hidden="true"
    />
  );
};

/**
 * Skeleton group for common loading patterns
 */
export const SkeletonGroup = {
  AlgorithmList: () => (
    <div className="space-y-2">
      {[...Array(6)].map((_, i) => (
        <Skeleton key={i} variant="algorithm-card" />
      ))}
    </div>
  ),

  PaletteGrid: () => (
    <div className="flex flex-wrap gap-2">
      {[...Array(8)].map((_, i) => (
        <Skeleton key={i} variant="palette-swatch" />
      ))}
    </div>
  ),

  ImagePreview: () => (
    <div className="space-y-3">
      <Skeleton variant="image" />
      <div className="space-y-2">
        <Skeleton variant="text" width="70%" />
        <Skeleton variant="text" width="50%" />
      </div>
    </div>
  ),

  Settings: () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Skeleton variant="text" width="30%" />
        <Skeleton height="6px" />
      </div>
      <div className="space-y-2">
        <Skeleton variant="text" width="40%" />
        <Skeleton height="6px" />
      </div>
      <div className="space-y-2">
        <Skeleton variant="text" width="35%" />
        <Skeleton height="6px" />
      </div>
    </div>
  ),

  ButtonGroup: ({ count = 3 }: { count?: number }) => (
    <div className="flex gap-2">
      {[...Array(count)].map((_, i) => (
        <Skeleton key={i} variant="button" width="80px" />
      ))}
    </div>
  ),
};

export default Skeleton;
