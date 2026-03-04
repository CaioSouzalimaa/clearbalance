"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { CheckCircle2, X, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export type ToastType = "success" | "error";

interface ToastItem {
  id: string;
  msg: string;
  type: ToastType;
  /** true after mount so CSS transition can run */
  visible: boolean;
}

interface ToastContextValue {
  toast: (msg: string, type?: ToastType) => void;
}

/* ------------------------------------------------------------------ */
/* Context                                                             */
/* ------------------------------------------------------------------ */

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}

/* ------------------------------------------------------------------ */
/* Individual toast card                                               */
/* ------------------------------------------------------------------ */

const TOAST_DURATION = 4000;
const EXIT_DURATION = 300;

interface ToastCardProps extends ToastItem {
  onDismiss: (id: string) => void;
}

function ToastCard({ id, msg, type, visible, onDismiss }: ToastCardProps) {
  const isSuccess = type === "success";

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={cn(
        "flex w-80 items-start gap-3 rounded-xl border bg-surface px-4 py-3 shadow-lg transition-all duration-300",
        isSuccess
          ? "border-green-300 dark:border-green-800"
          : "border-rose-300 dark:border-rose-800",
        visible
          ? "translate-x-0 opacity-100"
          : "translate-x-full opacity-0",
      )}
    >
      {/* coloured left accent */}
      <span
        className={cn(
          "mt-0.5 shrink-0",
          isSuccess
            ? "text-green-600 dark:text-green-400"
            : "text-rose-600 dark:text-rose-400",
        )}
      >
        {isSuccess ? (
          <CheckCircle2 className="h-5 w-5" aria-hidden />
        ) : (
          <XCircle className="h-5 w-5" aria-hidden />
        )}
      </span>

      {/* message */}
      <p className="flex-1 text-sm text-foreground">{msg}</p>

      {/* dismiss */}
      <button
        type="button"
        onClick={() => onDismiss(id)}
        aria-label="Fechar notificação"
        className="mt-0.5 shrink-0 text-muted-foreground transition hover:text-foreground"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Provider                                                            */
/* ------------------------------------------------------------------ */

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, dispatch] = useState<ToastItem[]>([]);
  const counterRef = useRef(0);

  /** Remove a toast (with exit animation) */
  const remove = useCallback((id: string) => {
    // first hide → then unmount after transition
    dispatch((prev) =>
      prev.map((t) => (t.id === id ? { ...t, visible: false } : t)),
    );
    setTimeout(() => {
      dispatch((prev) => prev.filter((t) => t.id !== id));
    }, EXIT_DURATION);
  }, []);

  const toast = useCallback(
    (msg: string, type: ToastType = "success") => {
      const id = String(++counterRef.current);
      // add hidden first so the first render is off-screen
      dispatch((prev) => [...prev, { id, msg, type, visible: false }]);
      // trigger enter transition on next tick
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          dispatch((prev) =>
            prev.map((t) => (t.id === id ? { ...t, visible: true } : t)),
          );
        });
      });
      // auto-dismiss
      setTimeout(() => remove(id), TOAST_DURATION);
    },
    [remove],
  );

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}

      {/* Portal — fixed bottom-right */}
      <div
        aria-label="Notificações"
        className="pointer-events-none fixed bottom-4 right-4 z-[9999] flex flex-col items-end gap-2"
      >
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto">
            <ToastCard {...t} onDismiss={remove} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
