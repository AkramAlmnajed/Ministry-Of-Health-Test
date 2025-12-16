import { useMemo, useState } from "react";
import { AuthContext, TOKEN_KEY } from "./AuthContext";
import type { AuthContextValue } from "./AuthContext";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));

  const login: AuthContextValue["login"] = (newToken) => {
    localStorage.setItem(TOKEN_KEY, newToken);
    setToken(newToken);
  };

  const logout: AuthContextValue["logout"] = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
  };

  const value = useMemo<AuthContextValue>(
    () => ({ token, isAuthed: !!token, login, logout }),
    [token]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
