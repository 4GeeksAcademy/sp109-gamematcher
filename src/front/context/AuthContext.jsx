import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_BACKEND_URL;



const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // { email, role, ... }
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  // Verificar si hay sesión activa al cargar
  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (token) {
      // Como no tenemos endpoint /me, recuperamos datos básicos
      const userData = {
        email: "admin",
        role: "admin",
        name: "admin"
      };
      setUser(userData);
      setIsAuthenticated(true);
    }
  }, []);

  const loginUser = async (nickname, password) => {
    try {
      const res = await fetch(`${API_URL}/api/user-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nickname, password }),
      });

      if (!res.ok) throw new Error("Nickname o contraseña incorrectos");
      const data = await res.json();
      sessionStorage.setItem("token", data.access_token);

      const userData = {
        name: nickname,
        email: `${nickname}@user.com`,  // Email simulado
        role: "user"  // Usuario normal
      };
      setUser(userData);
      setIsAuthenticated(true);
      navigate("/");
    } catch (err) {
      console.error("Login error:", err);
      throw err;
    }
  };

  const loginAdmin = async (username, password) => {
    try {
      const res = await fetch(`${API_URL}/api/admin-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: username, password }),
      });

      if (!res.ok) throw new Error("Nombre o contraseña incorrectos");
      const data = await res.json();
      sessionStorage.setItem("token", data.access_token);

      const userData = {
        name: username,
        email: `${username}@admin.com`,  // Email simulado
        role: "admin"  // Administrador
      };
      setUser(userData);
      setIsAuthenticated(true);
      navigate("/");
    } catch (err) {
      console.error("Login error:", err);
      throw err;
    }
  };

  // Función legacy - mantener compatibilidad
  const login = loginAdmin; const logout = () => {
    sessionStorage.removeItem("token");
    setUser(null);
    setIsAuthenticated(false);
    navigate("/");
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, loginUser, loginAdmin, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
