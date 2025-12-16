import { Outlet, useNavigate } from "react-router-dom";
import { useState } from "react";
import Sidebar from "./Sidebar";
import UserMenu from "./UserMenu";

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    // Add your logout logic here (e.g., clear auth, call logout API)
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -left-40 top-0 h-96 w-96 rounded-full bg-blue-500/10 blur-[120px]" />
        <div className="absolute -right-40 bottom-0 h-96 w-96 rounded-full bg-violet-500/10 blur-[120px]" />
      </div>

      <Sidebar
        open={sidebarOpen}
        collapsed={sidebarCollapsed}
        onClose={() => setSidebarOpen(false)}
        onToggleCollapse={() => setSidebarCollapsed((s) => !s)}
        onLogout={handleLogout}
      />

      <div
        className={[
          "relative z-10 min-w-0 transition-[padding] duration-300 ease-out",
          sidebarCollapsed ? "sm:pl-[80px]" : "sm:pl-[280px]",
        ].join(" ")}
      >
        {/* Top bar */}
        <header className="sticky top-0 z-30 border-b border-slate-800/50 bg-slate-950/80 backdrop-blur-xl">
          <div className="flex items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-4">
              {/* Mobile menu */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-400 transition-all hover:bg-slate-800 hover:text-white sm:hidden"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              <div>
                <h2 className="text-sm font-semibold text-white">Admin Dashboard</h2>
                <p className="text-xs text-slate-500">Products management</p>
              </div>
            </div>

            <UserMenu />
          </div>
        </header>

        <main className="min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
