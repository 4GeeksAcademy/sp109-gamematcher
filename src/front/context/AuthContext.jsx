import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_BACKEND_URL;

const AuthContext = createContext();

const LS_TOKEN_KEY = "token";
const LS_USER_KEY = "user";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // { id, name, nickname, email, role, profile_image_url }
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [onboardingCompleted, setOnboardingCompleted] = useState(true); // Por defecto true, se cambia según backend
  const navigate = useNavigate();

  // ---- helpers de storage ----
  const saveToken = (t) => localStorage.setItem(LS_TOKEN_KEY, t);
  const getToken = () => localStorage.getItem(LS_TOKEN_KEY);
  const clearToken = () => localStorage.removeItem(LS_TOKEN_KEY);

  const saveUserLS = (u) => localStorage.setItem(LS_USER_KEY, JSON.stringify(u));
  const getUserLS = () => {
    try {
      const raw = localStorage.getItem(LS_USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  };
  const clearUserLS = () => localStorage.removeItem(LS_USER_KEY);

  // ---- util: traer usuario fresco del backend ----
  const refreshUserFromServer = async (tokenParam) => {
    const token = tokenParam || getToken();
    if (!token) return null;

    const res = await fetch(`${API_URL}/api/verify-token`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      // token inválido o expirado
      clearToken();
      clearUserLS();
      setUser(null);
      setIsAuthenticated(false);
      return null;
    }

    const freshUser = await res.json();
    setUser(freshUser);
    setIsAuthenticated(true);
    saveUserLS(freshUser);
    return freshUser;
  };

  // ---- boot: hidratar cache y validar token ----
  useEffect(() => {
    const boot = async () => {
      const cachedUser = getUserLS();
      const token = getToken();

      // Hidrata rápido la UI si hay user en cache
      if (cachedUser) {
        setUser(cachedUser);
        setIsAuthenticated(true);
      }

      if (token) {
        await refreshUserFromServer(token);
      } else {
        clearUserLS();
        setUser(null);
        setIsAuthenticated(false);
      }
    };

    boot();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- Onboarding ----
  const checkOnboardingStatus = async (userId) => {
    try {
      const token = getToken();
      if (!token) {
        setOnboardingCompleted(false);
        return false;
      }

      const response = await fetch(`${API_URL}/api/onboarding/status/${userId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        const completed = !!data.is_completed;
        setOnboardingCompleted(completed);
        return completed;
      }

      setOnboardingCompleted(false);
      return false;
    } catch (error) {
      console.error("Error checking onboarding status:", error);
      setOnboardingCompleted(false);
      return false;
    }
  };

  // ---- login user ----
  const loginUser = async (nickname, password) => {
    try {
      const res = await fetch(`${API_URL}/api/user-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nickname, password }),
      });

      if (!res.ok) throw new Error("Nickname o contraseña incorrectos");

      const data = await res.json(); // { access_token, user_type }
      const token = data.access_token;
      saveToken(token);

      const freshUser = await refreshUserFromServer(token);
      if (!freshUser) throw new Error("Error obteniendo datos del usuario");

      // Solo verificar onboarding para usuarios regulares
      if ((freshUser.role || "user") === "user") {
        const completed = await checkOnboardingStatus(freshUser.id);
        if (!completed) {
          navigate("/onboarding");
          return freshUser;
        }
      }

      navigate("/");
      return freshUser;
    } catch (err) {
      console.error("Login error:", err);
      clearToken();
      clearUserLS();
      setUser(null);
      setIsAuthenticated(false);
      throw err;
    }
  };

  // ---- login admin ----
  const loginAdmin = async (username, password) => {
    try {
      const res = await fetch(`${API_URL}/api/admin-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: username, password }),
      });

      if (!res.ok) throw new Error("Nombre o contraseña incorrectos");

      const data = await res.json(); // { access_token, user_type }
      const token = data.access_token;
      saveToken(token);

      const freshUser = await refreshUserFromServer(token);
      if (!freshUser) throw new Error("Error obteniendo datos del administrador");

      navigate("/");
      return freshUser;
    } catch (err) {
      console.error("Admin login error:", err);
      clearToken();
      clearUserLS();
      setUser(null);
      setIsAuthenticated(false);
      throw err;
    }
  };

  // ---- logout ----
  const logout = () => {
    clearToken();
    clearUserLS();
    setUser(null);
    setIsAuthenticated(false);
    setOnboardingCompleted(true); // Reset onboarding state
    navigate("/");
  };

  // ---- actualizar parcialmente el usuario (p. ej., profile_image_url) ----
  const updateUser = (partial) => {
    setUser((prev) => {
      const next = { ...(prev || {}), ...partial };
      saveUserLS(next);
      return next;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        onboardingCompleted,
        loginUser,
        loginAdmin,
        logout,
        checkOnboardingStatus,
        updateUser,
        getToken,
        refreshUserFromServer,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export { AuthContext };





