import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState("login"); // "login" o "signup"
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  const { loginUser, isAuthenticated } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await loginUser(nickname, password);
    } catch (err) {
      setError(err.message || "Error de autenticación");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/user-signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nickname, password }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.msg || "Error al registrarse");
      setSuccess("¡Registro exitoso! Ahora puedes iniciar sesión.");
      setMode("login");
      setNickname("");
      setPassword("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (isAuthenticated) return null; // Ocultar login/registro si ya está logueado

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <div className="d-flex justify-content-center mb-3">
                <button
                  className={`btn btn-sm ${mode === "login" ? "btn-primary" : "btn-outline-primary"} me-2`}
                  onClick={() => setMode("login")}
                >
                  Iniciar Sesión
                </button>
                <button
                  className={`btn btn-sm ${mode === "signup" ? "btn-primary" : "btn-outline-primary"}`}
                  onClick={() => setMode("signup")}
                >
                  Registrarse
                </button>
              </div>

              <h3 className="text-center mb-4">
                {mode === "login" ? "Iniciar Sesión" : "Crear Cuenta"}
              </h3>

              <form onSubmit={mode === "login" ? handleLogin : handleSignup}>
                <div className="form-group mb-3">
                  <label htmlFor="nickname">Nickname:</label>
                  <input
                    type="text"
                    id="nickname"
                    className="form-control"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    required
                    placeholder="tu_nickname"
                  />
                </div>
                <div className="form-group mb-3">
                  <label htmlFor="password">Contraseña:</label>
                  <input
                    type="password"
                    id="password"
                    className="form-control"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Tu contraseña"
                  />
                </div>

                {error && <div className="alert alert-danger">{error}</div>}
                {success && <div className="alert alert-success">{success}</div>}

                <button type="submit" className="btn btn-primary w-100 mb-3" disabled={loading}>
                  {loading
                    ? mode === "login"
                      ? "Iniciando..."
                      : "Registrando..."
                    : mode === "login"
                    ? "Iniciar Sesión"
                    : "Registrarse"}
                </button>
              </form>

              <div className="text-center">
                <p className="text-muted">¿Eres administrador?</p>
                <Link to="/admin-login" className="btn btn-outline-secondary">
                  Login de Admin
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

