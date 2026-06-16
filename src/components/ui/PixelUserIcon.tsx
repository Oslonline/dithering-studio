export const PIXEL_USER: ReadonlyArray<readonly [number, number]> = [
  [2, 0],
  [3, 0],
  [1, 1],
  [2, 1],
  [3, 1],
  [4, 1],
  [2, 2],
  [3, 2],
  [1, 3],
  [2, 3],
  [3, 3],
  [4, 3],
  [0, 4],
  [1, 4],
  [4, 4],
  [5, 4],
  [1, 5],
  [2, 5],
  [3, 5],
  [4, 5],
  [2, 6],
  [3, 6],
];

interface PixelUserIconProps {
  className?: string;
}

const PixelUserIcon: React.FC<PixelUserIconProps> = ({ className = "h-3.5 w-3.5" }) => (
  <svg
    className={className}
    viewBox="0 0 8 8"
    fill="currentColor"
    shapeRendering="crispEdges"
    aria-hidden="true"
  >
    {PIXEL_USER.map(([x, y]) => (
      <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} />
    ))}
  </svg>
);

export default PixelUserIcon;
