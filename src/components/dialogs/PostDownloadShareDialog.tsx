import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { createFocusTrap } from "../../utils/a11y";

interface PostDownloadShareDialogProps {
  open: boolean;
  onClose: () => void;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  processedCanvasRef: React.RefObject<HTMLCanvasElement>;
  lastFormat?: string;
  isVideo?: boolean;
}

const CAPTIONS = [
  "Fresh pixels brewed at ditheringstudio.com",
  "Algorithmic grain courtesy of Dithering Studio",
  "Handing error diffusion some style @ ditheringstudio.com",
  "Pattern + palette = 👌 — try it at ditheringstudio.com",
  "From noise to nuance with Dithering Studio",
  "One more reason to love pixel art — ditheringstudio.com",
  "Old school vibes, new school tool: ditheringstudio.com",
  "Dithered this piece — explore more at ditheringstudio.com",
];
const randomCaption = () => CAPTIONS[Math.floor(Math.random() * CAPTIONS.length)];

const PostDownloadShareDialog: React.FC<PostDownloadShareDialogProps> = ({ open, onClose, canvasRef, processedCanvasRef, lastFormat, isVideo }) => {
  const { t } = useTranslation();
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [sharing, setSharing] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      const c = processedCanvasRef.current || canvasRef.current;
      if (c) {
        try {
          setPreview(c.toDataURL("image/png"));
        } catch {
          setPreview(null);
        }
      }
    } else {
      setPreview(null);
      setSharing(false);
      setNotice(null);
    }
  }, [open, processedCanvasRef, canvasRef]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (dialogRef.current && !dialogRef.current.contains(e.target as Node)) onClose();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    
    if (dialogRef.current) {
      const cleanup = createFocusTrap(dialogRef.current);
      return () => {
        document.removeEventListener("mousedown", onDoc);
        document.removeEventListener("keydown", onKey);
        cleanup();
      };
    }
    
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  const share = () => {
    const c = processedCanvasRef.current || canvasRef.current;
    if (!c) return;
    setSharing(true);
    setNotice(null);
    const caption = randomCaption();
    const tweetBody = `${caption} #dithering #pixelart\nTry it: https://ditheringstudio.com/Dithering`;
    c.toBlob(async (blob) => {
      if (!blob) {
        setSharing(false);
        return;
      }
      const file = new File([blob], "dithered.png", { type: blob.type });
      try {
        const nav: any = navigator;
        if (nav.canShare && nav.canShare({ files: [file] })) {
          await nav.share({ files: [file], text: tweetBody });
          setSharing(false);
          onClose();
          return;
        }
      } catch {
        /* ignore */
      }
      const intent = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetBody)}`;
      try {
        window.open(intent, "_blank", "noopener");
      } catch {
        // ignore
      }
      setSharing(false);
      setNotice(t('tool.shareDialog.tweetComposerNotice'));
    }, "image/png");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in" aria-hidden="true" />
      <div 
        ref={dialogRef} 
        className="relative w-full max-w-sm overflow-hidden rounded-lg border border-neutral-800/70 bg-gradient-to-b from-[#161616] to-[#0b0b0b] p-5 shadow-[0_0_0_1px_#222,inset_0_0_30px_-10px_rgba(255,255,255,0.07)] animate-scale-in"
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-dialog-title"
      >
        <div className="mb-3 flex items-center justify-between">
          <h2 id="share-dialog-title" className="font-mono text-[11px] tracking-wider text-gray-300">{t('tool.shareDialog.title')}</h2>
          <button 
            onClick={onClose} 
            className="clean-btn px-2 py-0 text-[11px]"
            aria-label={t('tool.shareDialog.close')}
          >
            ✕
          </button>
        </div>
        {preview && (
          <div className="mb-4 rounded-md border border-neutral-800/80 bg-neutral-900/60 p-2">
            <img src={preview} alt={isVideo ? t('tool.shareDialog.videoPreview') : t('tool.shareDialog.imagePreview')} className="mx-auto max-h-48 w-auto object-contain" />
          </div>
        )}
        <div className="mb-5 space-y-2 text-[11px] leading-snug text-gray-400">
          <p className="font-semibold text-gray-300">{isVideo ? t('tool.shareDialog.videoComplete') : t('tool.shareDialog.imageSaved')}</p>
          <p className="text-gray-400">{isVideo ? t('tool.shareDialog.shareVideoHint') : t('tool.shareDialog.shareImageHint')}</p>
          <p className="text-gray-500">{isVideo ? t('tool.shareDialog.captionHintVideo') : t('tool.shareDialog.captionHintImage')}</p>
          {lastFormat && (
            <p className="text-[10px] text-gray-500">
              {t('tool.shareDialog.format')}: <span className="text-gray-300">{lastFormat.toUpperCase()}</span>
            </p>
          )}
        </div>
        <button 
          onClick={share} 
          disabled={sharing} 
          className={`clean-btn clean-btn-primary mb-3 w-full justify-center text-[11px] ${sharing ? "cursor-not-allowed opacity-60" : ""}`}
          aria-label={t('tool.shareDialog.shareButton')}
        >
          {sharing ? t('tool.shareDialog.preparing') : t('tool.shareDialog.shareOnX')}
        </button>
        {notice && <p className="mb-2 text-center text-[10px] text-amber-400">{notice}</p>}
        <p className="text-center text-[10px] text-gray-500">{t('tool.shareDialog.autoAttach')}</p>
        <div className="mt-4 border-t border-neutral-800 pt-3 text-center">
          <p className="text-[9px] leading-relaxed text-gray-600">
            {t('tool.shareDialog.feedback')}{" "}
            <a href="https://twitter.com/Oslo418" target="_blank" rel="noopener noreferrer" className="text-gray-400 underline decoration-dotted hover:text-gray-300">
              @Oslo418
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PostDownloadShareDialog;
