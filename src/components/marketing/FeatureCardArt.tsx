import type { SVGProps } from "react";
import { ColorsSwatch, Computer, Image, Upload, User, Video } from "pixelarticons/react";

type FeatureCardArtProps = {
  tag: string;
  large?: boolean;
};

type PixelIcon = React.ComponentType<SVGProps<SVGSVGElement>>;

type HalftoneRect = {
  x: string;
  y: string;
  width: string;
  height: string;
  fillOpacity: string;
};

const HALFTONE_COLS = 40;
const HALFTONE_ROWS = 30;
const HALFTONE_PRECISION = 1e8;

/** Round to fixed precision so Node SSR and browser hydration produce identical strings. */
function formatHalftone(n: number): string {
  return (Math.round(n * HALFTONE_PRECISION) / HALFTONE_PRECISION).toFixed(8);
}

/**
 * Structured square halftone: fixed grid pitch, only square size varies.
 * Large squares at bottom-right fade out before the top-left; wave perturbs
 * the boundary for a curved "halftone vignette" edge (like classic print dots).
 */
function buildStructuredHalftone(): HalftoneRect[] {
  const rects: HalftoneRect[] = [];
  const maxDist = Math.hypot(HALFTONE_COLS, HALFTONE_ROWS) * 0.64;

  for (let row = 0; row < HALFTONE_ROWS; row++) {
    for (let col = 0; col < HALFTONE_COLS; col++) {
      const dx = HALFTONE_COLS - 0.5 - col;
      const dy = HALFTONE_ROWS - 0.5 - row;
      const dist = Math.hypot(dx, dy);
      const angle = Math.atan2(dy, dx);

      const wave =
        Math.sin(angle * 2.4 - 0.35) * maxDist * 0.07 +
        Math.cos(angle * 1.15 + dist * 0.11) * maxDist * 0.035;
      const effectiveDist = dist + wave;

      const raw = 1 - effectiveDist / maxDist;
      if (raw <= 0) continue;

      const t = Math.pow(raw, 0.76);
      if (t < 0.055) continue;

      const size = 0.08 + t * 0.5;
      const x = col + (1 - size) / 2;
      const y = row + (1 - size) / 2;
      const opacity = 0.16 + t * 0.58;
      rects.push({
        x: formatHalftone(x),
        y: formatHalftone(y),
        width: formatHalftone(size),
        height: formatHalftone(size),
        fillOpacity: formatHalftone(opacity),
      });
    }
  }

  return rects;
}

const ALGO_HALFTONE_RECTS = buildStructuredHalftone();

function CornerHalftoneSquares() {
  return (
    <svg
      className="h-full w-full text-neutral-500"
      viewBox={`0 0 ${HALFTONE_COLS} ${HALFTONE_ROWS}`}
      preserveAspectRatio="xMaxYMax meet"
      aria-hidden="true"
      shapeRendering="crispEdges"
    >
      {ALGO_HALFTONE_RECTS.map((rect, i) => (
        <rect
          key={i}
          x={rect.x}
          y={rect.y}
          width={rect.width}
          height={rect.height}
          fill="currentColor"
          fillOpacity={rect.fillOpacity}
        />
      ))}
    </svg>
  );
}

function SingleIcon({ Icon, className }: { Icon: PixelIcon; className: string }) {
  return (
    <div className="flex h-full w-full items-end justify-end pb-1.5 pr-1.5">
      <Icon className={`h-[62%] w-[62%] shrink-0 ${className}`} shapeRendering="crispEdges" aria-hidden="true" />
    </div>
  );
}

function DualIcon({
  left: Left,
  right: Right,
  leftClassName,
  rightClassName,
}: {
  left: PixelIcon;
  right: PixelIcon;
  leftClassName: string;
  rightClassName: string;
}) {
  return (
    <div className="flex h-full w-full items-end justify-end gap-1.5 pb-1.5 pr-1.5">
      <Left className={`h-[56%] w-[56%] shrink-0 ${leftClassName}`} shapeRendering="crispEdges" aria-hidden="true" />
      <Right className={`h-[56%] w-[56%] shrink-0 ${rightClassName}`} shapeRendering="crispEdges" aria-hidden="true" />
    </div>
  );
}

/** Pixelarticons (MIT) — https://pixelarticons.com */
function MediaArt() {
  return (
    <DualIcon
      left={Image}
      right={Video}
      leftClassName="text-blue-400/75"
      rightClassName="text-violet-400/70"
    />
  );
}

export default function FeatureCardArt({ tag, large = false }: FeatureCardArtProps) {
  const isAlgoHalftone = tag === "algo" && large;
  const sizeClass = "h-20 w-20 sm:h-24 sm:w-24";
  const insetClass = "right-5 bottom-5 sm:right-6 sm:bottom-6";

  if (isAlgoHalftone) {
    return (
      <div
        className={`pointer-events-none absolute inset-0 select-none mix-blend-screen pt-8 pr-5 pb-5 pl-12 sm:pt-10 sm:pr-6 sm:pb-6 sm:pl-14`}
        aria-hidden="true"
        style={{ imageRendering: "pixelated" }}
      >
        <div className="relative h-full w-full">
          <div className="absolute right-0 bottom-0 h-[83%] w-[74%] sm:h-[90%] sm:w-[82%]">
            <CornerHalftoneSquares />
          </div>
        </div>
      </div>
    );
  }

  const art = (() => {
    switch (tag) {
      case "algo":
        return null;
      case "media":
        return <MediaArt />;
      case "local":
        return <SingleIcon Icon={Computer} className="text-emerald-400/72" />;
      case "export":
        return <SingleIcon Icon={Upload} className="text-sky-400/78" />;
      case "palette":
        return <SingleIcon Icon={ColorsSwatch} className="text-rose-400/72" />;
      case "free":
        return <SingleIcon Icon={User} className="text-amber-400/72" />;
      default:
        return null;
    }
  })();

  if (!art) return null;

  return (
    <div
      className={`pointer-events-none absolute ${insetClass} opacity-[0.24] mix-blend-screen select-none ${sizeClass}`}
      aria-hidden="true"
      style={{ imageRendering: "pixelated" }}
    >
      {art}
    </div>
  );
}
