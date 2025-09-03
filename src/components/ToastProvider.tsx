import React, { createContext, useCallback, useContext, useRef, useState, useEffect } from "react";

export interface Toast {
  id: number;
  message: string;
  level?: "info" | "error" | "success" | "warn";
  ttl?: number;
}

interface ToastContextValue {
  push: (t: Omit<Toast, "id">) => void;
  remove: (id: number) => void;
}

const ToastCtx = createContext<ToastContextValue | null>(null);

export const useToasts = () => {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error("useToasts outside <ToastProvider>");
  return ctx;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<Toast[]>([]);
  const idRef = useRef(1);

  const remove = useCallback((id: number) => {
    setItems((list) => list.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (t: Omit<Toast, "id">) => {
      const id = idRef.current++;
      const ttl = t.ttl ?? 4000;
      setItems((list) => [...list, { id, ...t }]);
      if (ttl > 0) setTimeout(() => remove(id), ttl);
    },
    [remove],
  );

  // Expose minimal API globally for non-React code paths (e.g., inside hooks without context access when decoupled)
  (window as any).__toasts = { push };
  // Also listen for CustomEvent('toast') for non-context callers
  useEffect(() => {
    const handler = (e: any) => {
      const d = e.detail || {};
      push({ message: d.message || "Notice", level: d.variant || d.level || "info", ttl: d.ttl });
    };
    window.addEventListener("toast", handler as any);
    return () => window.removeEventListener("toast", handler as any);
  }, [push]);

  return (
    <ToastCtx.Provider value={{ push, remove }}>
      {children}
      <div className="fixed bottom-2 left-2 z-50 flex max-w-sm flex-col gap-2">
        {items.map((t) => (
          <div key={t.id} className={`rounded border border-neutral-700 bg-neutral-900/90 px-3 py-2 font-mono text-[11px] tracking-wide text-gray-200 shadow backdrop-blur ${t.level === "error" ? "border-red-600 text-red-300" : t.level === "success" ? "border-emerald-600 text-emerald-300" : t.level === "warn" ? "border-amber-500 text-amber-300" : ""}`}>
            {t.message}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
};

export default ToastProvider;
