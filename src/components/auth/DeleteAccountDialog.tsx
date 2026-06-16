"use client";

import { useEffect, useRef, useState } from "react";
import { createFocusTrap } from "../../utils/a11y";

interface DeleteAccountDialogProps {
  open: boolean;
  confirmText: string;
  confirmHint: string;
  loading: boolean;
  error: string | null;
  onClose: () => void;
  onConfirm: (typedConfirmation: string) => void;
}

export default function DeleteAccountDialog({
  open,
  confirmText,
  confirmHint,
  loading,
  error,
  onClose,
  onConfirm,
}: DeleteAccountDialogProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [typedUsername, setTypedUsername] = useState("");
  const dialogRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) {
      setStep(1);
      setTypedUsername("");
    }
  }, [open]);

  useEffect(() => {
    if (!open || !dialogRef.current) return;
    const trap = createFocusTrap(dialogRef.current);
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !loading) onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      trap?.();
      document.removeEventListener("keydown", onKey);
    };
  }, [open, loading, onClose]);

  if (!open) return null;

  const confirmationMatches = typedUsername.trim() === confirmText;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-account-title"
        className="w-full max-w-md rounded-xl border border-red-900/40 bg-[#111] p-6 shadow-2xl"
      >
        {step === 1 ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <h2 id="delete-account-title" className="text-lg font-semibold text-red-300">
                Delete account?
              </h2>
              <p className="text-sm leading-relaxed text-gray-400">
                This permanently removes your account, profile, and any saved community data linked to
                your user. This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-2">
              <button type="button" className="clean-btn flex-1 justify-center py-2" onClick={onClose}>
                Cancel
              </button>
              <button
                type="button"
                className="clean-btn flex-1 justify-center border-red-800/60 py-2 text-red-300 hover:bg-red-950/40"
                onClick={() => setStep(2)}
              >
                Continue
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <h2 id="delete-account-title" className="text-lg font-semibold text-red-300">
                Confirm deletion
              </h2>
              <p className="text-sm text-gray-400">
                {confirmHint}{" "}
                <span className="font-mono text-gray-200">{confirmText}</span> to confirm.
              </p>
            </div>
            <input
              type="text"
              value={typedUsername}
              onChange={(event) => setTypedUsername(event.target.value)}
              autoComplete="off"
              spellCheck={false}
              placeholder={confirmText}
              className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-gray-100"
            />
            {error && <p className="text-xs text-red-300">{error}</p>}
            <div className="flex gap-2">
              <button
                type="button"
                className="clean-btn flex-1 justify-center py-2"
                onClick={() => setStep(1)}
                disabled={loading}
              >
                Back
              </button>
              <button
                type="button"
                className="clean-btn flex-1 justify-center border-red-800/60 py-2 text-red-300 hover:bg-red-950/40 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={!confirmationMatches || loading}
                onClick={() => onConfirm(typedUsername.trim())}
              >
                {loading ? "Deleting..." : "Delete my account"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
