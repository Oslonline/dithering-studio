"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import type { NormalizedCropRect } from "../../utils/cropImage";
import { FULL_CROP } from "../../utils/cropImage";

const MIN_FRACTION = 0.04;

type Handle = "move" | "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw";

interface ImageCropOverlayProps {
  imageUrl: string;
  applying?: boolean;
  initialCrop?: NormalizedCropRect;
  allowFullApply?: boolean;
  hintKey?: string;
  onApply: (rect: NormalizedCropRect) => void;
  onCancel: () => void;
}

function clampCrop(c: NormalizedCropRect): NormalizedCropRect {
  let { x, y, width, height } = c;
  width = Math.max(MIN_FRACTION, Math.min(1, width));
  height = Math.max(MIN_FRACTION, Math.min(1, height));
  x = Math.max(0, Math.min(1 - width, x));
  y = Math.max(0, Math.min(1 - height, y));
  return { x, y, width, height };
}

function applyDrag(start: NormalizedCropRect, dx: number, dy: number, handle: Handle): NormalizedCropRect {
  const right = start.x + start.width;
  const bottom = start.y + start.height;

  if (handle === "move") {
    return clampCrop({ ...start, x: start.x + dx, y: start.y + dy });
  }

  let x = start.x;
  let y = start.y;
  let width = start.width;
  let height = start.height;

  if (handle.includes("w")) {
    x = start.x + dx;
    width = right - x;
  }
  if (handle.includes("e")) {
    width = start.width + dx;
  }
  if (handle.includes("n")) {
    y = start.y + dy;
    height = bottom - y;
  }
  if (handle.includes("s")) {
    height = start.height + dy;
  }

  return clampCrop({ x, y, width, height });
}

const HANDLE_CLASS =
  "absolute z-10 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-sm border border-blue-300 bg-blue-500/80 shadow-sm";

export default function ImageCropOverlay({
  imageUrl,
  applying = false,
  initialCrop,
  allowFullApply = false,
  hintKey = "tool.cropHint",
  onApply,
  onCancel,
}: ImageCropOverlayProps) {
  const { t } = useTranslation();
  const rootRef = useRef<HTMLDivElement>(null);
  const [crop, setCrop] = useState<NormalizedCropRect>({ x: 0, y: 0, width: 1, height: 1 });
  const dragRef = useRef<{
    handle: Handle;
    startX: number;
    startY: number;
    startCrop: NormalizedCropRect;
    boxW: number;
    boxH: number;
  } | null>(null);

  useEffect(() => {
    setCrop(initialCrop ?? FULL_CROP);
  }, [imageUrl, initialCrop]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !applying) onCancel();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onCancel, applying]);

  const startDrag = useCallback(
    (event: React.PointerEvent, handle: Handle) => {
      if (applying) return;
      event.preventDefault();
      event.stopPropagation();
      const box = rootRef.current?.getBoundingClientRect();
      if (!box?.width || !box?.height) return;

      dragRef.current = {
        handle,
        startX: event.clientX,
        startY: event.clientY,
        startCrop: { ...crop },
        boxW: box.width,
        boxH: box.height,
      };
      (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    },
    [applying, crop],
  );

  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      const drag = dragRef.current;
      if (!drag) return;
      const dx = (event.clientX - drag.startX) / drag.boxW;
      const dy = (event.clientY - drag.startY) / drag.boxH;
      setCrop(applyDrag(drag.startCrop, dx, dy, drag.handle));
    };

    const onUp = () => {
      dragRef.current = null;
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, []);

  const canApply =
    allowFullApply ||
    crop.width < 0.999 ||
    crop.height < 0.999 ||
    crop.x > 0.001 ||
    crop.y > 0.001;

  return (
    <div
      ref={rootRef}
      data-crop-root
      className="absolute inset-0 z-40 touch-none select-none"
      onPointerDown={(e) => e.stopPropagation()}
    >
      <img
        src={imageUrl}
        alt=""
        className="pointer-events-none absolute inset-0 h-full w-full object-fill"
        draggable={false}
      />

      <div
        className="absolute border-2 border-blue-400/90 shadow-[0_0_0_9999px_rgba(0,0,0,0.58)]"
        style={{
          left: `${crop.x * 100}%`,
          top: `${crop.y * 100}%`,
          width: `${crop.width * 100}%`,
          height: `${crop.height * 100}%`,
        }}
      >
        <div
          className="absolute inset-0 cursor-move"
          onPointerDown={(e) => startDrag(e, "move")}
          aria-hidden
        />
        <div className={`${HANDLE_CLASS} left-0 top-0 cursor-nwse-resize`} onPointerDown={(e) => startDrag(e, "nw")} />
        <div className={`${HANDLE_CLASS} left-full top-0 cursor-nesw-resize`} onPointerDown={(e) => startDrag(e, "ne")} />
        <div className={`${HANDLE_CLASS} left-0 top-full cursor-nesw-resize`} onPointerDown={(e) => startDrag(e, "sw")} />
        <div className={`${HANDLE_CLASS} left-full top-full cursor-nwse-resize`} onPointerDown={(e) => startDrag(e, "se")} />
        <div
          className="absolute left-1/2 top-0 h-2 w-8 -translate-x-1/2 -translate-y-1/2 cursor-ns-resize"
          onPointerDown={(e) => startDrag(e, "n")}
        />
        <div
          className="absolute bottom-0 left-1/2 h-2 w-8 -translate-x-1/2 translate-y-1/2 cursor-ns-resize"
          onPointerDown={(e) => startDrag(e, "s")}
        />
        <div
          className="absolute left-0 top-1/2 h-8 w-2 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize"
          onPointerDown={(e) => startDrag(e, "w")}
        />
        <div
          className="absolute right-0 top-1/2 h-8 w-2 translate-x-1/2 -translate-y-1/2 cursor-ew-resize"
          onPointerDown={(e) => startDrag(e, "e")}
        />
      </div>

      <div className="pointer-events-auto absolute bottom-3 left-1/2 z-50 flex max-w-[calc(100%-1rem)] -translate-x-1/2 flex-wrap items-center justify-center gap-2 rounded-lg border border-neutral-700/80 bg-neutral-950/95 px-3 py-2 shadow-lg backdrop-blur-sm">
        <p className="w-full text-center text-[10px] text-gray-500">{t(hintKey)}</p>
        <button type="button" className="clean-btn px-3 py-1.5 text-[10px]" onClick={onCancel} disabled={applying}>
          {t("tool.cropCancel")}
        </button>
        <button
          type="button"
          className="clean-btn clean-btn-primary px-3 py-1.5 text-[10px]"
          onClick={() => onApply(crop)}
          disabled={applying || !canApply}
        >
          {applying ? t("tool.cropApplying") : t("tool.cropApply")}
        </button>
      </div>
    </div>
  );
}
