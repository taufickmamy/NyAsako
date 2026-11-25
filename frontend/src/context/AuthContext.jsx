import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import * as authService from "../services/authService";
import { WORKSPACE_STORAGE_KEY } from "../utils/constants";
import { hasAnyRole, roleKey } from "../utils/roles";

const AuthContext = createContext(null);

const USER_KEY = "user";
const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";

/** Lit l'utilisateur stocké localement (session persistante). */
function readUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function persistSession(data) {
  localStorage.setItem(USER_KEY, JSON.stringify(data.user));
  if (data.accessToken) localStorage.setItem(ACCESS_TOKEN_KEY, data.accessToken);
  if (data.refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
}

function clearStorage() {
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(WORKSPACE_STORAGE_KEY);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readUser);

  /** Connexion : mémorise l'utilisateur et le jeton JWT. */
  const login = useCallback((data) => {
    persistSession(data);
    setUser(data.user);
  }, []);

  /** Déconnexion complète (serveur + stockage local). */
  const logout = useCallback(async () => {
    await authService.logout();
    clearStorage();
    setUser(null);
  }, []);

  /** Met à jour le profil local (après modification du nom, e-mail, etc.). */
  const updateUser = useCallback((patch) => {
    setUser((previous) => {
      const next = { ...previous, ...patch };
      localStorage.setItem(USER_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  /** L'intercepteur Axios signale une session expirée : on vide l'état. */
  useEffect(() => {
    const handleExpired = () => {
      clearStorage();
      setUser(null);
    };
    window.addEventListener("nyasako:session-expired", handleExpired);
    return () => window.removeEventListener("nyasako:session-expired", handleExpired);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      role: roleKey(user?.role),
      login,
      logout,
      updateUser,
      hasRole: (...roles) => hasAnyRole(user, roles),
    }),
    [user, login, logout, updateUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth doit être utilisé dans un <AuthProvider>.");
  }
  return context;
}
