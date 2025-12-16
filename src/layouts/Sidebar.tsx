import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../features/auth/useAuth";
import { useToast } from "../components/toast/ToastContext";

type Props = {
  open: boolean;
  collapsed: boolean;
  onClose: () => void;
  onToggleCollapse: () => void;

  /** optional: if you want extra actions after logout */
  onLogout?: () => void;
};

export default function Sidebar({
  open,
  collapsed,
  onClose,
  onToggleCollapse,
  onLogout,
}: Props) {
  const width = collapsed ? 80 : 280;

  // ✅ same as UserMenu
  const { logout } = useAuth();
  const { push } = useToast();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    push({ type: "info", title: "Logged out", message: "Session cleared." });
    navigate("/login", { replace: true });

    // close mobile drawer if open
    onClose();

    // optional extra callback
    onLogout?.();
  };

  const Content = (
    <motion.aside
      animate={{ width }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="relative h-full overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950"
    >
      {/* Subtle gradient overlay */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-blue-500/[0.02] via-transparent to-violet-500/[0.02]" />

      {/* Border accent */}
      <div className="absolute right-0 top-0 h-full w-px bg-gradient-to-b from-slate-700/50 via-slate-800/30 to-slate-700/50" />

      {/* Header */}
      <div
        className={[
          "relative flex items-center px-5 py-6",
          collapsed ? "justify-center" : "justify-between",
        ].join(" ")}
      >
        <div className="flex items-center gap-3.5">
          <motion.div
            whileHover={{ scale: 1.05, rotate: 2 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 via-blue-600 to-violet-600 shadow-xl shadow-blue-500/30"
          >
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-black/20 to-transparent" />
            <span className="relative text-base font-bold tracking-tight text-white">M</span>
          </motion.div>

          <AnimatePresence mode="wait">
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.2 }}
              >
                <div className="text-base font-semibold tracking-tight text-white">Ministry of Health</div>
                <div className="text-xs font-medium text-slate-500">Admin Panel</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence mode="wait">
          {!collapsed && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onToggleCollapse}
              className="hidden h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition-all duration-200 hover:bg-slate-800/80 hover:text-slate-300 sm:flex"
              title="Collapse sidebar"
              type="button"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Expand button when collapsed */}
      <AnimatePresence>
        {collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="hidden px-4 pb-2 sm:block"
          >
            <button
              onClick={onToggleCollapse}
              className="mx-auto flex h-9 w-full items-center justify-center rounded-xl text-slate-500 transition-all duration-200 hover:bg-slate-800/80 hover:text-slate-300"
              title="Expand sidebar"
              type="button"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Divider */}
      <div className="mx-5 h-px bg-gradient-to-r from-transparent via-slate-700/50 to-transparent" />

      {/* Navigation */}
      <nav className="mt-6 flex flex-1 flex-col px-4">
        <AnimatePresence mode="wait">
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-600"
            >
              Menu
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-1.5">
          <SidebarItem label="Products" collapsed={collapsed} active />
        </div>

        <div className="flex-1" />

        {/* Logout Button (now behaves exactly like UserMenu logout) */}
        <div className="mb-6 mt-4">
          <div className="mx-1 mb-4 h-px bg-gradient-to-r from-transparent via-slate-700/50 to-transparent" />

          <motion.button
            type="button"
            whileHover={{ x: collapsed ? 0 : 3 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLogout}
            className={[
              // ✅ add "group" so group-hover works
              "group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200",
              collapsed ? "justify-center" : "",
              "text-slate-400 hover:bg-red-500/10 hover:text-red-400",
            ].join(" ")}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800/60 text-slate-400 transition-colors group-hover:bg-red-500/20 group-hover:text-red-400">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </div>

            <AnimatePresence mode="wait">
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="truncate"
                >
                  Logout
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </nav>
    </motion.aside>
  );

  return (
    <>
      {/* Desktop fixed sidebar */}
      <div className="fixed left-0 top-0 z-40 hidden h-screen sm:block">{Content}</div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open ? (
          <div className="fixed inset-0 z-50 sm:hidden">
            <motion.div
              className="absolute inset-0 bg-slate-950/90 backdrop-blur-md"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
            />
            <motion.div
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: "spring", stiffness: 350, damping: 35 }}
              className="absolute left-0 top-0 h-full w-[280px]"
            >
              {Content}
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>
    </>
  );
}

function SidebarItem({
  label,
  collapsed,
  active,
}: {
  label: string;
  collapsed: boolean;
  active?: boolean;
}) {
  if (collapsed) {
    return (
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={[
          "group relative mx-auto flex h-12 w-12 cursor-pointer items-center justify-center rounded-xl transition-all duration-200",
          active
            ? "bg-gradient-to-br from-blue-500 to-violet-600 text-white shadow-lg shadow-blue-500/30"
            : "bg-slate-800/50 text-slate-400 hover:bg-slate-800 hover:text-slate-200",
        ].join(" ")}
      >
        <span className="text-xs font-bold uppercase">{label.charAt(0)}</span>
        {active && (
          <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-slate-900 bg-emerald-400" />
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      whileHover={{ x: 3 }}
      whileTap={{ scale: 0.98 }}
      className={[
        "group relative flex cursor-pointer items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-medium transition-all duration-200",
        active
          ? "bg-slate-800/80 text-white shadow-inner"
          : "text-slate-400 hover:bg-slate-800/40 hover:text-slate-200",
      ].join(" ")}
    >
      {active && (
        <motion.div
          layoutId="activeSidebarIndicator"
          className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-gradient-to-b from-blue-400 to-violet-500 shadow-lg shadow-blue-500/50"
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        />
      )}

      <span className="truncate">{label}</span>

      {active && (
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="ml-auto">
          <span className="flex h-2 w-2 rounded-full bg-gradient-to-r from-blue-400 to-violet-500 shadow-lg shadow-blue-500/50" />
        </motion.div>
      )}
    </motion.div>
  );
}
