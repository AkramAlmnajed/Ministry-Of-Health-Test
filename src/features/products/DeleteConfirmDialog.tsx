import { AnimatePresence, motion } from "framer-motion";

export default function DeleteConfirmDialog({
  open,
  title,
  description,
  confirmText = "Delete",
  cancelText = "Cancel",
  pending,
  onClose,
  onConfirm,
}: {
  open: boolean;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  pending?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            onClick={() => (pending ? null : onClose())}
          />

          <div className="absolute inset-0 grid place-items-center p-4">
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.96 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl shadow-black/50"
            >
              <div className="p-6">
                {/* Icon */}
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10">
                  <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>

                <div className="mt-4 text-center">
                  <h3 className="text-lg font-semibold text-white">{title}</h3>
                  {description ? (
                    <p className="mt-2 text-sm text-slate-400">{description}</p>
                  ) : null}
                </div>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-slate-800 bg-slate-950/50 px-6 py-4 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => (pending ? null : onClose())}
                  disabled={pending}
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 px-5 py-3 text-sm font-medium text-slate-300 transition-all hover:bg-slate-700 hover:text-white sm:w-auto disabled:opacity-50"
                >
                  {cancelText}
                </button>

                <button
                  type="button"
                  onClick={() => (pending ? null : onConfirm())}
                  disabled={pending}
                  className="w-full rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-red-500/25 transition-all hover:bg-red-500 hover:shadow-xl hover:shadow-red-500/30 sm:w-auto disabled:opacity-50"
                >
                  {pending ? (
                    <span className="flex items-center justify-center gap-2">
                      <motion.span
                        className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                      />
                      Deleting...
                    </span>
                  ) : (
                    confirmText
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
