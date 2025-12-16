import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ToastContext } from "./ToastContext";
import type { Toast, ToastContextValue } from "./ToastContext";

function classes(...x: Array<string | false | null | undefined>) {
  return x.filter(Boolean).join(" ");
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push: ToastContextValue["push"] = (t) => {
    const id = crypto.randomUUID();
    const toast: Toast = { id, ...t };
    setToasts((prev) => [toast, ...prev]);

    window.setTimeout(() => {
      setToasts((prev) => prev.filter((x) => x.id !== id));
    }, 3000);
  };

  const value = useMemo(() => ({ push }), []);

  const accent = (type: Toast["type"]) =>
    ({
      success: "from-emerald-500/70 to-emerald-400/10",
      error: "from-red-500/70 to-red-400/10",
      info: "from-blue-500/70 to-violet-500/10",
    }[type]);

  const dot = (type: Toast["type"]) =>
    ({
      success: "bg-emerald-400",
      error: "bg-red-400",
      info: "bg-blue-400",
    }[type]);

  return (
    <ToastContext.Provider value={value}>
      {children}

      <div className="fixed right-3 top-3 z-50 flex w-[calc(100%-1.5rem)] max-w-sm flex-col gap-2 sm:right-6 sm:top-6">
        <AnimatePresence initial={false}>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.18 }}
              className={classes(
                // light mode
                "relative overflow-hidden rounded-2xl border bg-white/90 shadow-xl backdrop-blur",
                "border-slate-200",
                // dark mode to match sidebar
                "dark:border-slate-800/60 dark:bg-slate-950/55 dark:shadow-black/40"
              )}
            >
              {/* left accent glow */}
              <div className={classes("absolute inset-y-0 left-0 w-1.5 bg-gradient-to-b", accent(t.type))} />

              <div className="flex items-start gap-3 p-4">
                <motion.div
                  className={classes("mt-1.5 h-2.5 w-2.5 rounded-full", dot(t.type))}
                  animate={{ opacity: [0.55, 1, 0.55] }}
                  transition={{ duration: 1.1, repeat: Infinity }}
                />

                <div className="min-w-0">
                  <p className="font-semibold text-slate-900 dark:text-slate-100">{t.title}</p>
                  {t.message ? (
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{t.message}</p>
                  ) : null}
                </div>
              </div>

              {/* subtle bottom gradient like your UI */}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-slate-100/60 to-transparent dark:from-slate-950/40" />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
