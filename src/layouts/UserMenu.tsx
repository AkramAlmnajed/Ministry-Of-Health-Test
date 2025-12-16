import { useMemo } from "react";
import { motion } from "framer-motion";

export default function UserMenu() {
  const user = useMemo(() => ({ name: "John Admin", email: "admin@company.com" }), []);

  return (
    <div className="relative">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3.5 rounded-2xl border border-slate-800/60 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-800/50 px-4 py-2.5 shadow-lg shadow-black/20"
      >
        {/* Avatar */}
        <div className="relative">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 via-blue-600 to-violet-600 text-sm font-bold text-white shadow-lg shadow-blue-500/30">
            <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-black/20 to-transparent" />
            <span className="relative">J</span>
          </div>
          {/* Online indicator */}
          <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-slate-900 bg-emerald-500 shadow-lg shadow-emerald-500/50" />
        </div>
        
        {/* User info */}
        <div className="hidden text-left sm:block">
          <div className="text-sm font-semibold tracking-tight text-white">{user.name}</div>
          <div className="text-xs font-medium text-slate-500">{user.email}</div>
        </div>
      </motion.div>
    </div>
  );
}
