import { createContext } from "react";

export type AuthContextValue = {
  token: string | null;
  isAuthed: boolean;
  login: (token: string) => void;
  logout: () => void;
};

export const TOKEN_KEY = "moh_admin_token";

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
