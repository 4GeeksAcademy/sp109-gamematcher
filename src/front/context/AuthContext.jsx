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
    const verifyToken = async () => {
      const token = sessionStorage.getItem("token");
      if (token) {
        try {
          // Verificar token con el backend
          const res = await fetch(`${API_URL}/api/verify-token`, {
            method: "GET",
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json"
            }
          });

          if (res.ok) {
            const userData = await res.json();
            setUser(userData);
            setIsAuthenticated(true);
          } else {
            // Token inválido, limpiar sesión
            sessionStorage.removeItem("token");
            setUser(null);
            setIsAuthenticated(false);
          }
        } catch (error) {
          console.error("Error verificando token:", error);
          sessionStorage.removeItem("token");
          setUser(null);
          setIsAuthenticated(false);
        }
      }
    };

    verifyToken();
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

      // Obtener datos reales del usuario usando el token
      const verifyRes = await fetch(`${API_URL}/api/verify-token`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${data.access_token}`,
          "Content-Type": "application/json"
        }
      });

      if (verifyRes.ok) {
        const userData = await verifyRes.json();
        setUser(userData);
        setIsAuthenticated(true);
        navigate("/");
      } else {
        throw new Error("Error obteniendo datos del usuario");
      }
    } catch (err) {
      console.error("Login error:", err);
      sessionStorage.removeItem("token");
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

      // Obtener datos reales del admin usando el token
      const verifyRes = await fetch(`${API_URL}/api/verify-token`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${data.access_token}`,
          "Content-Type": "application/json"
        }
      });

      if (verifyRes.ok) {
        const userData = await verifyRes.json();
        setUser(userData);
        setIsAuthenticated(true);
        navigate("/");
      } else {
        throw new Error("Error obteniendo datos del administrador");
      }
    } catch (err) {
      console.error("Login error:", err);
      sessionStorage.removeItem("token");
      throw err;
    }
  };

  const logout = () => {
    sessionStorage.removeItem("token");
    setUser(null);
    setIsAuthenticated(false);
    navigate("/");
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, loginUser, loginAdmin, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
