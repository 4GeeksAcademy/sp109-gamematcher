import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";


export const Navbar = () => {
  const { isAuthenticated, user, logout, onboardingCompleted } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/"); // A la landing después de logout
  };

  const isAdmin = isAuthenticated && user?.role === "admin";
  const isUser = isAuthenticated && user?.role === "user";
  const inOnboarding = isUser && !onboardingCompleted;

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light shadow-sm">
      <div className="container">
        <Link to="/" className="navbar-brand d-flex align-items-center gap-2">
         
          <span className="fw-bold">Game Matcher</span>
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#mainNav"
          aria-controls="mainNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="mainNav">
          {/* LEFT SIDE LINKS */}
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            {/* --- Público (no autenticado): solo enlaces informativos --- */}
            {!isAuthenticated && (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/about">About us</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/team">Our team</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/contact">Contact</Link>
                </li>
              </>
            )}

            {/* --- Autenticado (user/admin): TODO lo que ya tenías --- */}
            {isAuthenticated && !inOnboarding && (
              <>
                {/* Botón Base de Datos SOLO si hay sesión */}
                <li className="nav-item">
                  <Link className="nav-link" to="/local-games">
                    <i className="fas fa-database"></i> Todos los juegos
                  </Link>
                </li>

                {/* USER */}
                {isUser && (
                  <>
                    <li className="nav-item">
                      <Link className="nav-link" to="/recommendations">
                        <i className="fas fa-star"></i> Recomendaciones
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" to="/user-game-favorites">
                        <i className="fas fa-heart"></i> Mis Favoritos
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" to="/user-platform-preferences">
                        <i className="fas fa-desktop"></i> Mis Plataformas
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" to="/user-genre-preferences">
                        <i className="fas fa-tags"></i> Mis Géneros
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" to="/users/non-favorites">
                        <i className="fas fa-times-circle"></i> No Favoritos
                      </Link>
                    </li>
                  </>
                )}

                {/* ADMIN */}
                {isAdmin && (
                  <>
                    <li className="nav-item">
                      <Link className="nav-link" to="/games">
                        <i className="fas fa-gamepad"></i> Games
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" to="/genres">
                        <i className="fas fa-tags"></i> Genres
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" to="/platforms">
                        <i className="fas fa-desktop"></i> Platforms
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" to="/users">
                        <i className="fas fa-users"></i> Users
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" to="/admins">
                        <i className="fas fa-user-shield"></i> Admins
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" to="/game-platforms">
                        <i className="fas fa-link"></i> Game-Platform
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" to="/game-genres">
                        <i className="fas fa-link"></i> Game-Genres
                      </Link>
                    </li>
                  </>
                )}
              </>
            )}
          </ul>

          {/* RIGHT SIDE (auth actions) */}
          <div className="d-flex align-items-center">
            {/* Onboarding: solo aviso + logout */}
            {isAuthenticated && inOnboarding && (
              <>
                <span className="text-muted me-2">
                  <i className="fas fa-user-clock"></i>{" "}
                  Completando configuración inicial...
                </span>
                <button className="btn btn-outline-danger" onClick={handleLogout}>
                  <i className="fas fa-sign-out-alt"></i> Logout
                </button>
              </>
            )}

            {/* No autenticado: Login + Register */}
            {!isAuthenticated && (
              <div className="d-flex gap-2">
                <Link to="/login" className="btn btn-outline-success">
                  <i className="fas fa-sign-in-alt"></i> Login
                </Link>
                <Link to="/onboarding" className="btn btn-primary">
                  Registrarse
                </Link>
              </div>
            )}

            {/* Autenticado (no onboarding): saludo + profile + logout */}
            {isAuthenticated && !inOnboarding && (
              <>
                <span className="text-muted me-2 d-none d-lg-inline">
                  <i className="fas fa-user"></i>{" "}
                  Hola, {user?.name || user?.nickname || "Usuario"}
                </span>
                <Link to="/profile" className="btn btn-outline-dark me-2">
                  <i className="fas fa-user-circle"></i> Profile
                </Link>
                <button className="btn btn-outline-danger" onClick={handleLogout}>
                  <i className="fas fa-sign-out-alt"></i> Logout
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};






